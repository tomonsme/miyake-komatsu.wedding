<template>
  <div class="relative inline-flex flex-col items-center gap-3">
    <button
      type="button"
      class="flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white backdrop-blur-md transition duration-300 ease-soft hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      :aria-pressed="isPlaying"
      :title="isPlaying ? 'BGMを一時停止' : 'BGMを再生'"
      @click="toggle"
    >
      <span class="sr-only">BGM toggle</span>
      <svg v-if="!isPlaying" class="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M6 19V5l12 7-12 7z" />
      </svg>
      <svg v-else class="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
      </svg>
    </button>
    <p class="text-xs font-medium uppercase tracking-[0.3em] text-white/80">BGM</p>
    <audio ref="audioRef" class="hidden" :src="src" preload="auto" loop playsinline></audio>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Props {
  src: string
}

const { src } = defineProps<Props>()

const audioRef = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)

const toggle = async () => {
  const audio = audioRef.value
  if (!audio) return

  try {
    if (audio.paused) {
      audio.muted = false
      await audio.play()
      isPlaying.value = true
    } else {
      audio.pause()
      isPlaying.value = false
    }
  } catch (error) {
    console.error('Failed to toggle BGM', error)
  }
}

onMounted(() => {
  if (audioRef.value) {
    audioRef.value.muted = true
    audioRef.value.volume = 0.6
  }
})
</script>
