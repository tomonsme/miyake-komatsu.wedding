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
  if (!apiKey || !from) return 'skipped'

  const toList = (to || '').split(',').map((s) => s.trim()).filter(Boolean)
  const subjectTag = payload.attendance === 'attending' ? 'ご出席' : payload.attendance === 'declining' ? 'ご欠席' : 'RSVP'
  const timestamp = new Date(payload.created_at).toLocaleString('ja-JP', { hour12: false })

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
    'ご回答ありがとうございます。以下の内容で承りました。',
    '',
    `出欠: ${payload.attendance}`,
    `同伴者数: ${payload.guests ?? 0}`,
    '',
    'メッセージ:',
    payload.message || '(なし)',
    '',
    'このメールにお心当たりがない場合は破棄してください。'
  ].join('\n')

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
