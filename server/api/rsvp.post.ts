import { createClient } from '@supabase/supabase-js'
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2'

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

  // Non-blocking: try sending SES notifications; do not fail the RSVP on email error
  const emailResult = await sendSesNotifications({
    region: (useRuntimeConfig(event) as any).sesRegion,
    from: (useRuntimeConfig(event) as any).sesFrom,
    to: (useRuntimeConfig(event) as any).sesTo,
    replyTo: (useRuntimeConfig(event) as any).sesReplyTo,
    accessKeyId: (useRuntimeConfig(event) as any).sesAccessKeyId,
    secretAccessKey: (useRuntimeConfig(event) as any).sesSecretAccessKey,
    payload
  }).catch((e) => {
    console.error('[rsvp.email]', e)
    return 'failed'
  })

  return { success: true, email: emailResult }
})

async function sendSesNotifications(options: {
  region: string
  from: string
  to: string
  replyTo?: string
  accessKeyId?: string
  secretAccessKey?: string
  payload: {
    name: string
    email: string
    attendance: string
    guests: number
    message: string
    created_at: string
  }
}) {
  const { region, from, to, replyTo, accessKeyId, secretAccessKey, payload } = options
  if (!region || !from || !to) return 'skipped'

  const client = new SESv2Client({
    region,
    // Netlify では AWS_ACCESS_KEY_ID などが予約されているため、独自の環境変数名から明示的に渡す
    credentials: accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined
  })
  const toList = to.split(',').map((s) => s.trim()).filter(Boolean)
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

  const adminCmd = new SendEmailCommand({
    FromEmailAddress: from,
    Destination: { ToAddresses: toList },
    ReplyToAddresses: replyTo ? [replyTo] : [],
    Content: {
      Simple: {
        Subject: { Data: `[RSVP] ${subjectTag} - ${payload.name}`, Charset: 'UTF-8' },
        Body: { Text: { Data: adminText, Charset: 'UTF-8' } }
      }
    }
  })

  const guestCmd = new SendEmailCommand({
    FromEmailAddress: from,
    Destination: { ToAddresses: [payload.email] },
    ReplyToAddresses: replyTo ? [replyTo] : [],
    Content: {
      Simple: {
        Subject: { Data: 'ご回答ありがとうございます（自動送信）', Charset: 'UTF-8' },
        Body: { Text: { Data: guestText, Charset: 'UTF-8' } }
      }
    }
  })

  await client.send(adminCmd)
  await client.send(guestCmd)
  return 'sent'
}
