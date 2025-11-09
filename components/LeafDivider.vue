<template>
  <div class="mx-auto w-24" :class="klass">
    <div class="h-px bg-[#DCC08E]/25"></div>
    <svg viewBox="0 0 60 10" class="mx-auto mt-1 h-2 w-8 text-[#DCC08E]/80" aria-hidden="true">
      <path fill="currentColor" d="M0 5h18c4 0 6-4 12-4s8 4 12 4h18"/>
    </svg>
  </div>
  
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ klass?: string }>(), { klass: '' })
const klass = props.klass
</script>
