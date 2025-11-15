<template>
  <main class="min-h-screen bg-royal text-white px-6 py-10">
    <div class="mx-auto w-full max-w-screen-lg">
      <h1 class="font-display text-2xl md:text-3xl">Admin Dashboard</h1>
      <p class="mt-2 text-sm text-white/70">RSVPの一覧・エクスポート</p>

      <div class="mt-6 flex items-end gap-3">
        <label class="block text-sm">
          <span class="block text-xs text-white/70">ADMIN_TOKEN</span>
          <input v-model="token" type="password" class="rounded-md border border-white/20 bg-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-gold w-64" placeholder="トークン" />
        </label>
        <button class="btn-gold btn-lg" @click="load">読み込み</button>
        <button class="btn-secondary btn-lg" :disabled="rows.length===0" @click="downloadCsv">CSVをダウンロード</button>
      </div>

      <div v-if="notice" class="mt-4 text-sm text-white/80">{{ notice }}</div>

      <div v-if="rows.length" class="mt-6">
        <div class="mb-3 flex flex-wrap items-center gap-3 text-sm">
          <label class="inline-flex items-center gap-2">
            <span>フィルタ:</span>
            <select v-model="filter" class="rounded-md border border-white/20 bg-white/10 px-2 py-1">
              <option value="all">すべて</option>
              <option value="attending">出席</option>
              <option value="declining">欠席</option>
            </select>
          </label>
          <button class="btn-secondary btn-sm" @click="copyEmails">メール一覧をコピー</button>
          <span class="text-white/60">件数: {{ filtered.length }}</span>
        </div>

        <div class="overflow-auto rounded-lg ring-1 ring-white/20">
          <table class="min-w-[900px] w-full text-sm">
            <thead class="bg-white/10">
              <tr>
                <th class="px-3 py-2 text-left font-semibold">日時</th>
                <th class="px-3 py-2 text-left font-semibold">お名前</th>
                <th class="px-3 py-2 text-left font-semibold">メール</th>
                <th class="px-3 py-2 text-left font-semibold">出欠</th>
                <th class="px-3 py-2 text-left font-semibold">同伴</th>
                <th class="px-3 py-2 text-left font-semibold">メッセージ</th>
                <th class="px-3 py-2 text-left font-semibold">写真</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in filtered" :key="r.created_at + r.email" class="odd:bg-white/5">
                <td class="align-top px-3 py-2 whitespace-nowrap">{{ toJP(r.created_at) }}</td>
                <td class="align-top px-3 py-2">{{ r.name }}</td>
                <td class="align-top px-3 py-2"><a class="underline" :href="'mailto:' + r.email">{{ r.email }}</a></td>
                <td class="align-top px-3 py-2">{{ jAttendance(r.attendance) }}</td>
                <td class="align-top px-3 py-2 text-center">{{ r.guests ?? 0 }}</td>
                <td class="align-top px-3 py-2 whitespace-pre-wrap">{{ r.message }}</td>
                <td class="align-top px-3 py-2">
                  <ul class="space-y-1">
                    <li v-for="u in r.photos" :key="u"><a class="underline break-all" :href="u" target="_blank" rel="noopener">{{ u }}</a></li>
                    <li v-if="!r.photos?.length" class="text-white/50">—</li>
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
type Row = { name: string; email: string; attendance: string; guests?: number; message: string; photos: string[]; created_at: string }

const token = ref('')
const rows = ref<Row[]>([])
const notice = ref('')
const filter = ref<'all'|'attending'|'declining'>('all')

onMounted(() => {
  const saved = localStorage.getItem('admin_token')
  if (saved) token.value = saved
})

const filtered = computed(() => rows.value.filter(r => filter.value==='all' ? true : r.attendance === filter.value))

function jAttendance(a: string){ return a === 'attending' ? '出席' : a === 'declining' ? '欠席' : a }
function toJP(iso: string){ try { return new Date(iso).toLocaleString('ja-JP', { hour12: false }) } catch { return iso } }

useHead({ meta: [{ name: 'robots', content: 'noindex,nofollow' }] })

async function load(){
  notice.value = ''
  rows.value = []
  if (!token.value) { notice.value = 'トークンを入力してください'; return }
  localStorage.setItem('admin_token', token.value)
  try {
    const { data, error } = await useFetch('/api/admin/rsvps', { headers: { Authorization: `Bearer ${token.value}` } })
    if (error.value) throw error.value
    if ((data.value as any)?.mode === 'google') {
      notice.value = '現在 RSVP_MODE=google のため Googleフォームのスプレッドシートをご確認ください'
      rows.value = []
      return
    }
    rows.value = ((data.value as any)?.rows || []) as Row[]
  } catch (e: any) {
    notice.value = e?.statusMessage || '読み込みに失敗しました'
  }
}

function asCsv(): string {
  const header = ['created_at','name','email','attendance','guests','message','photos']
  const esc = (s: any) => {
    const t = (s ?? '').toString()
    if (t.includes('"') || t.includes(',') || /\r|\n/.test(t)) return '"' + t.replace(/"/g,'""') + '"'
    return t
  }
  const lines = [header.join(',')]
  for (const r of filtered.value) {
    const row = [r.created_at, r.name, r.email, r.attendance, String(r.guests ?? 0), r.message, (r.photos||[]).join(' ')]
    lines.push(row.map(esc).join(','))
  }
  return lines.join('\n')
}

function downloadCsv(){
  const blob = new Blob([asCsv()], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'rsvps.csv'
  a.click()
  URL.revokeObjectURL(url)
}

async function copyEmails(){
  const list = filtered.value.map(r => r.email).filter(Boolean).join('\n')
  try { await navigator.clipboard.writeText(list); notice.value = 'メールアドレスをコピーしました'; setTimeout(() => notice.value = '', 1500) } catch {}
}
</script>
