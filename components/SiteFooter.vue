<template>
  <footer class="mt-12 md:mt-16 border-t border-[#DCC08E]/30 bg-gradient-to-b from-[#0E1828] to-[#111E33]">
    <div class="mx-auto max-w-screen-lg px-4 md:px-6 py-6 md:py-10">
      <!-- Top emblem row: show only on mobile to save space on desktop -->
      <div class="mb-3 flex flex-col items-center md:hidden">
        <img v-if="monogramUrl" :src="monogramUrl" alt="monogram" class="h-7 w-auto opacity-90" loading="lazy" />
        <span class="mt-2 block h-px w-14 bg-[#DCC08E]/50"></span>
        <!-- Mobile: keep Invitation title and tagline visible in compact style -->
        <h3 class="mt-2 font-display text-base tracking-wide text-gold">Invitation</h3>
        <LeafDivider />
        <p class="mt-1 text-xs leading-relaxed text-white/80 text-center">大切なゲストのみなさまへ。心を込めて。</p>
      </div>
      
      <!-- Desktopも中央縦積み（全ブロック中央寄せ） -->
      <div class="mx-auto max-w-screen-md grid gap-6 justify-items-center text-center">
        <div class="max-w-prose mx-auto hidden md:block">
          <h3 class="font-display text-lg tracking-wide text-gold">Invitation</h3>
          <LeafDivider />
          <p class="mt-2 text-sm leading-relaxed text-white/80">大切なゲストのみなさまへ。心を込めて。</p>
        </div>
        <div class="max-w-prose mx-auto">
          <h4 class="hidden md:block text-[11px] font-semibold uppercase tracking-[0.3em] text-white/70">Links</h4>
          <ul class="mt-0 md:mt-2 flex justify-center gap-4 text-sm">
            <li><a href="/#message" @click.prevent="go('#message')" class="text-gold hover:opacity-90 underline-offset-4 hover:underline">Message</a></li>
            <li><a href="/#events" @click.prevent="go('#events')" class="text-gold hover:opacity-90 underline-offset-4 hover:underline">Information</a></li>
            <li><a href="/#rsvp" @click.prevent="go('#rsvp')" class="text-gold hover:opacity-90 underline-offset-4 hover:underline">RSVP</a></li>
          </ul>
        </div>
        <div class="max-w-prose mx-auto">
          <h4 class="hidden md:block text-[11px] font-semibold uppercase tracking-[0.3em] text-white/70">Contact</h4>
          <p class="mt-0 md:mt-2 text-xs md:text-sm leading-relaxed text-white/80">ご不明点は招待状の送信者までご連絡ください。</p>
        </div>
      </div>
      <div class="mt-4 md:mt-8 text-center text-xs md:text-sm text-white/70 leading-relaxed">
        <p class="break-words">&copy; {{ new Date().getFullYear() }} {{ copyrightLabel }}</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import LeafDivider from './LeafDivider.vue'
const appCfg = useAppConfig() as any
const monogramUrl = appCfg?.invitation?.monogramUrl || ''
const copyrightLabel = appCfg?.invitation?.copyrightLabel || 'Invitation'

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
