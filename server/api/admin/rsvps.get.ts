import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'no-store')
  const config = useRuntimeConfig(event)
  // Accept either ?token=... or Authorization: Bearer <token>
  const qToken = getQuery(event).token as string | undefined
  const auth = getHeader(event, 'authorization') || ''
  const bearer = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7).trim() : ''
  const token = qToken || bearer || undefined
  const expected = (process.env.ADMIN_TOKEN || (config as any).adminToken || '').toString()

  if (!expected) {
    throw createError({ statusCode: 500, statusMessage: 'ADMIN_TOKEN is not configured.' })
  }
  if (!token || token !== expected) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  if (config.rsvpMode !== 'supabase') {
    // In Google Form mode, there is no server DB; instruct to use the sheet directly
    return { mode: 'google', rows: [] }
  }

  if (!config.supabaseUrl || (!config.supabaseAnonKey && !(config as any).supabaseServiceRole)) {
    throw createError({ statusCode: 500, statusMessage: 'Supabase configuration is incomplete.' })
  }

  const supabaseKey = ((config as any).supabaseServiceRole as string) || config.supabaseAnonKey
  const supabase = createClient(config.supabaseUrl, supabaseKey, { auth: { persistSession: false } })
  const { data, error } = await supabase
    .from('rsvps')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch RSVPs.' })
  }

  const rows = (data || []).map((r: any) => {
    const msg = (r.message || '').toString()
    const photos = extractPhotoUrls(msg)
    return {
      name: r.name || '',
      email: r.email || '',
      attendance: r.attendance || '',
      guests: r.guests ?? 0,
      message: msg,
      photos,
      created_at: r.created_at || ''
    }
  })

  return { mode: 'supabase', rows }
})

function extractPhotoUrls(message: string): string[] {
  const urls = new Set<string>()
  const lines = message.split(/\r?\n/)
  for (const raw of lines) {
    let line = raw.trim()
    if (!line) continue
    // remove bullet prefix like '- '
    line = line.replace(/^[-•\s]+/, '')
    const m = line.match(/https?:\/\/\S+/g)
    if (m) {
      m.forEach((u) => {
        // basic image hint
        if (/\.(png|jpe?g|webp|gif)(\?|#|$)/i.test(u) || /supabase|storage|bucket/i.test(u)) {
          urls.add(u)
        }
      })
    }
  }
  return Array.from(urls)
}
