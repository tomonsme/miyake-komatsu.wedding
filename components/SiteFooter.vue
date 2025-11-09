<template>
  <footer class="mt-16 border-t border-[#DCC08E]/30 bg-gradient-to-b from-[#0E1828] to-[#111E33]">
    <div class="mx-auto max-w-screen-lg px-6 py-10">
      <div class="mb-6 flex flex-col items-center">
        <img v-if="monogramUrl" :src="monogramUrl" alt="monogram" class="h-8 w-auto opacity-90" loading="lazy" />
        <span class="mt-3 block h-px w-16 bg-[#DCC08E]/50"></span>
      </div>
      
      <div class="grid gap-8 md:grid-cols-3 text-center md:text-left">
        <div class="max-w-prose mx-auto md:mx-0">
          <h3 class="font-display text-lg tracking-wide text-white">Invitation</h3>
          <LeafDivider />
          <p class="mt-2 text-sm leading-relaxed text-white/80">大切なゲストのみなさまへ。心を込めて。</p>
        </div>
        <div class="max-w-prose mx-auto md:mx-0">
          <h4 class="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/70">Links</h4>
          <ul class="mt-2 space-y-1 text-sm text-white/80">
            <li><a href="/#message" @click.prevent="go('#message')" class="link-underline hover:text-white">Message</a></li>
            <li><a href="/#events" @click.prevent="go('#events')" class="link-underline hover:text-white">Information</a></li>
            <li><a href="/#rsvp" @click.prevent="go('#rsvp')" class="link-underline hover:text-white">RSVP</a></li>
          </ul>
        </div>
        <div class="max-w-prose mx-auto md:mx-0">
          <h4 class="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/70">Contact</h4>
          <p class="mt-2 text-sm leading-relaxed text-white/80">ご不明点は招待状の送信者までご連絡ください。</p>
        </div>
      </div>
      <div class="mt-8 text-center text-xs text-white/40 tracking-wide">
        <p>&copy; {{ new Date().getFullYear() }} Invitation</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import LeafDivider from './LeafDivider.vue'
const appCfg = useAppConfig() as any
const monogramUrl = appCfg?.invitation?.monogramUrl || ''

function go(hash: string){
  const el = document.querySelector(hash) as HTMLElement | null
  if (!el){ location.href = '/' + hash; return }
  const header = document.querySelector('header.sticky') as HTMLElement | null
  const headerH = header?.offsetHeight ?? 64
  const extra = 12
  const y = el.getBoundingClientRect().top + window.scrollY - headerH - extra
  window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' })
}
</script>
