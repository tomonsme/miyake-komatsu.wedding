<template>
  <header class="mb-10 flex flex-col items-center gap-2 text-center">
    <span class="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">{{ eyebrow }}</span>
    <h2 class="relative font-display text-2xl tracking-wide text-ink md:text-3xl">
      {{ title }}
      <span class="absolute left-1/2 -bottom-2 h-[2px] w-12 -translate-x-1/2 bg-gold" aria-hidden="true"></span>
    </h2>
    <p v-if="description" class="mt-2 max-w-prose text-sm leading-relaxed text-ink/70 md:text-base">{{ description }}</p>
  </header>
</template>

<script setup lang="ts">
interface Props {
  eyebrow: string
  title: string
  description?: string
}

defineProps<Props>()
</script>
