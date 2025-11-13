<template>
  <header
    ref="rootHeader"
    class="sticky top-0 z-40 w-full border-b border-champagne/40 bg-royal/85 transition-colors duration-300"
    :class="{ 'bg-royal/95 border-champagne/60': scrolled }"
  >
    <div class="mx-auto grid max-w-screen-lg grid-cols-3 items-center px-4 h-14">
      <div class="hidden md:block"></div> <!-- spacer to center brand on md+ -->
      <NuxtLink to="/" class="justify-self-center flex items-center gap-2">
        <img src="/favicon.png" alt="logo" class="h-6 w-6" />
        <span class="font-display text-lg leading-none tracking-wide text-white text-shadow-soft uppercase">Invitation</span>
      </NuxtLink>

      <div class="flex items-center justify-end">
        <nav class="hidden gap-3 text-sm font-medium text-white/80 md:flex">
          <NuxtLink v-for="item in items" :key="item.hash" :to="'/' + item.hash"
            class="relative rounded-md px-2 py-1 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 uppercase tracking-wide"
            @click.prevent="go(item.hash)"
            :class="{
              'text-white after:absolute after:left-1/2 after:-bottom-0.5 after:h-[2px] after:w-6 after:-translate-x-1/2 after:rounded-full after:bg-gold after:transition-all after:duration-300': active === item.id
            }"
          >{{ item.label }}</NuxtLink>
        </nav>
        <button class="fixed right-2.5 z-[75] grid h-10 w-10 place-items-center rounded-full bg-black/35 text-white shadow-sm ring-1 ring-white/35 hover:bg-black/45 md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold" :style="hamburgerStyle" @click="toggle()" :aria-expanded="open" aria-label="menu" aria-controls="mobile-menu">
          <svg v-if="!open" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
    </div>
    <!-- Mobile overlay menu -->
    <div v-if="open" id="mobile-menu" class="fixed inset-0 z-[70] md:hidden">
      <!-- dim background clickable to close -->
      <div class="absolute inset-0 bg-royal/95" @click="toggle" aria-hidden="true"></div>
      <!-- panel -->
      <div class="absolute inset-x-0 top-0 mx-auto max-w-screen-sm rounded-b-3xl bg-royal shadow-lg ring-1 ring-white/20">
        <div class="relative px-4 pb-6 pt-16">
          <h2 class="text-center text-sm uppercase tracking-[0.3em] text-white/70">Menu</h2>
          <button class="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white/90 ring-1 ring-white/30 hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold" @click="toggle" aria-label="close menu">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
          <nav class="mt-4 grid gap-3">
            <button v-for="item in items" :key="item.hash"
                    class="group flex w-full items-center justify-between rounded-2xl bg-white/15 px-4 py-4 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.18)] hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold uppercase tracking-wide"
                    @click.prevent="go(item.hash)">
              <span class="text-base uppercase tracking-wide">{{ item.label }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white/70 group-hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M9 6l6 6-6 6"/></svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
    <!-- Mobile quick nav removed for clarity -->
    <!-- Scroll progress bar (subtle gold) -->
    <div class="h-[2px] bg-gold/30" aria-hidden="true">
      <div class="h-[2px] bg-gold/80 origin-left" :style="{ transform: `scaleX(${progress})` }"></div>
    </div>
  </header>
</template>

<script setup lang="ts">
const open = ref(false)
const progress = ref(0) // scroll progress 0..1
const scrolled = ref(false)
const rootHeader = ref<HTMLElement | null>(null)
const hamburgerStyle = ref<Record<string, string>>({ top: '10px' })
function toggle(){ open.value = !open.value }
function go(hash: string){
  open.value = false
  const el = document.querySelector(hash) as HTMLElement | null
  if (el) {
    // Scroll with header offset so titles are not hidden
    const header = document.querySelector('header.sticky') as HTMLElement | null
    const headerH = header?.offsetHeight ?? 64
    const extra = 12 // small breathing room
    const y = el.getBoundingClientRect().top + window.scrollY - headerH - extra
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' })
  } else {
    // fallback: navigate with hash
    location.href = '/' + hash
  }
}

const items = [
  { id: 'message', label: 'Message', hash: '#message' },
  { id: 'profile', label: 'Profile', hash: '#profile' },
  { id: 'events', label: 'Information', hash: '#events' },
  { id: 'rsvp', label: 'RSVP', hash: '#rsvp' }
]

const active = ref<string>('')

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (visible?.target?.id) active.value = visible.target.id
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
  )
  items.forEach((i) => {
    const el = document.getElementById(i.id)
    if (el) observer.observe(el)
  })

  const onScroll = () => {
    const scrolled = window.scrollY
    const h = document.documentElement.scrollHeight - window.innerHeight
    progress.value = h > 0 ? Math.min(1, scrolled / h) : 0
    ;(scrolled as any)
  }
  const onScrollHeader = () => {
    scrolled.value = window.scrollY > 8
  }
  const updateHamburgerTop = () => {
    const h = rootHeader.value?.offsetHeight ?? 56
    const btnHalf = 20 // h-10
    const t = Math.max(6, Math.round(h / 2 - btnHalf))
    hamburgerStyle.value = { top: t + 'px' }
  }
  onScroll()
  updateHamburgerTop()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('scroll', onScrollHeader, { passive: true })
  window.addEventListener('resize', updateHamburgerTop, { passive: true })
})
</script>
