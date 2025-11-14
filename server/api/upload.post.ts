import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'node:crypto'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'no-store')
  const config = useRuntimeConfig(event)

  if (config.rsvpMode !== 'supabase') {
    throw createError({ statusCode: 400, statusMessage: 'Upload requires RSVP_MODE=supabase' })
  }
  if (!config.supabaseUrl || (!config.supabaseAnonKey && !(config as any).supabaseServiceRole)) {
    throw createError({ statusCode: 500, statusMessage: 'Supabase configuration is incomplete.' })
  }

  const form = await readMultipartFormData(event)
  if (!form || form.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No files received.' })
  }

  const supabaseKey = ((config as any).supabaseServiceRole as string) || config.supabaseAnonKey
  const supabase = createClient(config.supabaseUrl, supabaseKey, { auth: { persistSession: false } })
  const bucket = 'guest-photos'
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const basePath = `${y}/${m}/${d}`

  const urls: string[] = []

  for (const part of form) {
    if (part.type !== 'file' || !part.filename) continue
    const contentType = part.type === 'file' ? part.mimetype || 'application/octet-stream' : 'application/octet-stream'
    if (!contentType.startsWith('image/')) continue
    // enforce 10MB limit server-side
    if (part.data && part.data.length > 10 * 1024 * 1024) {
      throw createError({ statusCode: 413, statusMessage: 'File too large (max 10MB).' })
    }
    const ext = part.filename.split('.').pop() || 'bin'
    const key = `${basePath}/${randomUUID()}.${ext}`
    const { error: upErr } = await supabase.storage.from(bucket).upload(key, part.data, { contentType, upsert: false })
    if (upErr) {
      console.error('[upload]', upErr)
      throw createError({ statusCode: 500, statusMessage: 'Failed to upload file.' })
    }
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(key)
    if (pub?.publicUrl) urls.push(pub.publicUrl)
  }

  return { urls }
})
