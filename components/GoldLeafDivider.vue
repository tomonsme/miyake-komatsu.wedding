<template>
  <svg :class="['mx-auto mt-2', klass]" width="72" height="20" viewBox="0 0 72 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient :id="gid" x1="0" y1="0" x2="0" y2="20" gradientUnits="userSpaceOnUse">
        <stop stop-color="rgba(240,230,214,1)"/>
        <stop offset="1" stop-color="rgba(189,160,106,1)"/>
      </linearGradient>
    </defs>
    <g stroke="rgb(var(--gold))" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 10h60" stroke="rgb(var(--gold))" stroke-opacity=".6"/>
      <g :transform="`translate(${leafX} 10) scale(${scale})`">
        <path d="M0 8 C 6 5 6 -5 0 -8 C -6 -5 -6 5 0 8 Z" :fill="`url(#${gid})`" stroke-width="1"/>
        <path d="M0 6 L 0 -6" stroke="rgba(255,255,255,.7)" stroke-width="0.8"/>
      </g>
    </g>
  </svg>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ klass?: string; align?: 'left' | 'center' | 'right' }>(), {
  klass: '',
  align: 'center'
})
const gid = `gld-${Math.random().toString(36).slice(2)}`
const scale = 0.9
const leafX = props.align === 'left' ? 14 : props.align === 'right' ? 58 : 36
</script>

