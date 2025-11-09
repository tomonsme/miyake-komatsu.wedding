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
})
</script>
