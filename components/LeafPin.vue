<template>
  <svg :width="size" :height="size" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="inline-block align-[0.05em]">
    <defs>
      <linearGradient :id="gid" x1="0" y1="0" x2="0" y2="20" gradientUnits="userSpaceOnUse">
        <stop stop-color="#F1E7CE"/>
        <stop offset="1" stop-color="#DCC08E"/>
      </linearGradient>
    </defs>
    <path d="M10 17 C 13 15 13 5 10 3 C 7 5 7 15 10 17 Z" :fill="`url(#${gid})`" stroke="rgb(var(--gold))" stroke-width="0.8"/>
  </svg>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ size?: number }>(), { size: 8 })
const gid = `lp-${Math.random().toString(36).slice(2)}`
const size = props.size
</script>

