import { createClient } from '@supabase/supabase-js'

interface RsvpPayload {
  name: string
  email: string
  attendance: 'attending' | 'declining' | string
  guests?: number
  message?: string
}

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'no-store')
  const config = useRuntimeConfig(event)

  if (config.rsvpMode !== 'supabase') {
    throw createError({ statusCode: 400, statusMessage: 'RSVP mode is not set to supabase.' })
  }

  const body = await readBody<RsvpPayload>(event)

  if (!body.name || !body.email || !body.attendance) {
    throw createError({ statusCode: 422, statusMessage: 'Missing required fields.' })
  }

  if (!config.supabaseUrl || (!config.supabaseAnonKey && !(config as any).supabaseServiceRole)) {
    throw createError({ statusCode: 500, statusMessage: 'Supabase configuration is incomplete.' })
  }

  const supabaseKey = ((config as any).supabaseServiceRole as string) || config.supabaseAnonKey
  const supabase = createClient(config.supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  })

  const payload = {
    name: body.name,
    email: body.email,
    attendance: body.attendance,
    guests: body.guests ?? 0,
    message: body.message ?? '',
    created_at: new Date().toISOString()
  }

  // Prefer upsert to allow guests to resubmit/modify by email.
  // If the table doesn't have a suitable conflict target, fall back to insert.
  let error: any = null
  try {
    const up = await supabase.from('rsvps').upsert(payload, { onConflict: 'email' })
    error = up.error
  } catch (e) {
    error = e
  }
  if (error) {
    try {
      const ins = await supabase.from('rsvps').insert(payload)
      if (ins.error) {
        console.error('[rsvp.insert]', ins.error)
        throw createError({ statusCode: 500, statusMessage: 'Failed to store RSVP.' })
      }
    } catch (e) {
      console.error('[rsvp.insert.catch]', e)
      throw createError({ statusCode: 500, statusMessage: 'Failed to store RSVP.' })
    }
  }

  // Non-blocking: try sending email notifications; do not fail the RSVP on email error
  const cfg = useRuntimeConfig(event) as any
  console.log('[rsvp.email.config]', {
    hasApiKey: !!cfg.sendgridApiKey,
    hasFrom: !!cfg.sendgridFrom,
    hasTo: !!cfg.sendgridTo
  })
  const emailResult = await sendEmailNotifications({
    apiKey: cfg.sendgridApiKey,
    from: cfg.sendgridFrom,
    to: cfg.sendgridTo,
    replyTo: cfg.sendgridReplyTo,
    payload
  }).catch((e) => {
    console.error('[rsvp.email]', e)
    return 'failed'
  })

  return { success: true, email: emailResult }
})

async function sendEmailNotifications(options: {
  apiKey: string
  from: string
  to?: string
  replyTo?: string
  payload: {
    name: string
    email: string
    attendance: string
    guests: number
    message: string
    created_at: string
  }
}) {
  const { apiKey, from, to, replyTo, payload } = options
  if (!apiKey || !from) {
    console.warn('[rsvp.email] skipped: missing apiKey or from')
    return 'skipped'
  }

  const toList = (to || '').split(',').map((s) => s.trim()).filter(Boolean)
  const subjectTag = payload.attendance === 'attending' ? 'ご出席' : payload.attendance === 'declining' ? 'ご欠席' : 'RSVP'
  const timestamp = new Date(payload.created_at).toLocaleString('ja-JP', { hour12: false })

  // Invitation meta from app config (for party overview / signature)
  let eventDateLabel = ''
  let receptionOpenTime = ''
  let receptionTime = ''
  let ceremonyTime = ''
  let venueName = ''
  let venueAddress = ''
  let photoShareUrl = ''
  let photoShareDeadlineLabel = ''
  let groomName = ''
  let brideName = ''

  try {
    const appCfg = (typeof useAppConfig !== 'undefined' ? (useAppConfig() as any) : null) || {}
    const inv = appCfg.invitation || {}
    const formatIsoToJp = (iso?: string) => {
      if (!iso) return ''
      const d = new Date(iso)
      if (Number.isNaN(d.getTime())) return ''
      const y = d.getFullYear()
      const m = d.getMonth() + 1
      const day = d.getDate()
      return `${y}年${m}月${day}日`
    }
    eventDateLabel = formatIsoToJp(inv.eventDateIso)
    ceremonyTime = inv.ceremonyTime || ''
    receptionOpenTime = inv.receptionOpenTime || ''
    receptionTime = inv.receptionTime || ''
    venueName = inv.venueName || ''
    venueAddress = inv.venueAddress || ''
    photoShareUrl = inv.photoShareUrl || ''
    photoShareDeadlineLabel = formatIsoToJp(inv.photoShareDeadlineIso || inv.rsvpDeadlineIso)
    groomName = inv.groomName || ''
    brideName = inv.brideName || ''
  } catch (e) {
    console.warn('[rsvp.email] failed to read app config', e)
  }

  const adminText = [
    '新しいRSVPが届きました。',
    '',
    `日時: ${timestamp}`,
    `お名前: ${payload.name}`,
    `メール: ${payload.email}`,
    `出欠: ${payload.attendance}`,
    `同伴者数: ${payload.guests ?? 0}`,
    '',
    'メッセージ:',
    payload.message || '(なし)'
  ].join('\n')

  const guestText = [
    `${payload.name} 様`,
    '',
    '出欠のご回答をいただきありがとうございました。',
    '',
    '以下の内容で承りました。',
    '',
    '■当日のご案内',
    eventDateLabel ? `開催日：${eventDateLabel}` : '',
    ceremonyTime ? `挙式開始時刻：${ceremonyTime}` : '',
    receptionOpenTime ? `受付開始時刻：${receptionOpenTime}` : '',
    receptionTime ? `披露宴開始時刻：${receptionTime}` : '',
    venueName ? `会場名：${venueName}` : '',
    venueAddress ? `会場住所：${venueAddress}` : '',
    '',
    photoShareUrl
      ? '■写真共有について\n当日は、おふたりのご意向により、写真をご共有いただけます。'
      : '',
    photoShareUrl ? (photoShareDeadlineLabel ? `受付締切：${photoShareDeadlineLabel}` : '') : '',
    photoShareUrl ? `共有用URL：${photoShareUrl}` : '',
    photoShareUrl ? '' : '',
    '■ご登録内容',
    `出欠情報：${subjectTag}`,
    `氏名：${payload.name}`,
    `メールアドレス：${payload.email}`,
    `同伴者数：${payload.guests ?? 0}`,
    '',
    'メッセージ：',
    payload.message || '(なし)',
    '',
    'このメールにお心当たりがない場合は破棄してください。',
    '',
    '----------------------------------------',
    groomName || brideName ? `${groomName}${groomName && brideName ? '・' : ''}${brideName}` : '',
    'Wedding Reception'
  ].filter((line) => line !== '').join('\n')

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  }
  const fromObj = { email: from }
  const replyToObj = replyTo ? { email: replyTo } : undefined

  // 管理者向け通知
  if (toList.length) {
    const adminRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        from: fromObj,
        personalizations: [{ to: toList.map((e) => ({ email: e })) }],
        reply_to: replyToObj,
        subject: `[RSVP] ${subjectTag} - ${payload.name}`,
        content: [{ type: 'text/plain', value: adminText }]
      })
    })
    if (!adminRes.ok) {
      const text = await adminRes.text().catch(() => '')
      throw new Error(`SendGrid admin email failed: ${adminRes.status} ${text}`)
    }
  }

  // ゲスト向け確認メール
  const guestRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      from: fromObj,
      personalizations: [{ to: [{ email: payload.email }] }],
      reply_to: replyToObj,
      subject: 'ご回答ありがとうございます（自動送信）',
      content: [{ type: 'text/plain', value: guestText }]
    })
  })
  if (!guestRes.ok) {
    const text = await guestRes.text().catch(() => '')
    throw new Error(`SendGrid guest email failed: ${guestRes.status} ${text}`)
  }

  return 'sent'
}
