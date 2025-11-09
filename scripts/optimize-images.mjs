import sharp from 'sharp'
import { promises as fs } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

async function ensureFileExists(p) {
  try { await fs.access(p); return true } catch { return false }
}

async function optimizeOverlay() {
  const src = join(root, 'public', 'welcome-overlay.png')
  const dst = join(root, 'public', 'welcome-overlay.webp')
  const exists = await ensureFileExists(src)
  if (!exists) {
    console.error(`[optimize] Not found: ${src}`)
    return false
  }
  const img = sharp(src)
  // Keep original dimensions, use high-quality alpha-friendly WebP
  await img.webp({ quality: 82, alphaQuality: 80, effort: 4 }).toFile(dst)
  const stat = await fs.stat(dst)
  console.log(`[optimize] Wrote ${dst} (${Math.round(stat.size/1024)} kB)`) 
  return true
}

async function main() {
  const ok = await optimizeOverlay()
  if (!ok) process.exitCode = 1
}

main()

