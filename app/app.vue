<template>
  <div class="font-serif">
    <NuxtLoadingIndicator color="#BDA06A" /> <!-- gold accent for loading -->
    <NuxtRouteAnnouncer />
    <SiteHeader />
    <NuxtPage />
    <SiteFooter />
  </div>
  
</template>

<script setup lang="ts">
// Use explicit relative imports to avoid alias resolution issues during dev
import SiteHeader from '../components/SiteHeader.vue'
import SiteFooter from '../components/SiteFooter.vue'

onMounted(() => {
  // Add/remove a flag on <html> while scrolling to relax heavy effects
  let scrollTimer: number | null = null
  const onScrollActive = () => {
    document.documentElement.classList.add('is-scrolling')
    if (scrollTimer) window.clearTimeout(scrollTimer)
    scrollTimer = window.setTimeout(() => {
      document.documentElement.classList.remove('is-scrolling')
      scrollTimer = null
    }, 140)
  }

  const nodes = Array.from(document.querySelectorAll('section')) as HTMLElement[]
  const set = new Set<HTMLElement>()
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        (e.target as HTMLElement).classList.add('is-in')
        set.add(e.target as HTMLElement)
        if (set.size === nodes.length) io.disconnect()
      }
    })
  }, { threshold: 0.15 })
  nodes.forEach((n) => {
    n.classList.add('reveal')
    io.observe(n)
  })

  window.addEventListener('scroll', onScrollActive, { passive: true })
})
</script>
