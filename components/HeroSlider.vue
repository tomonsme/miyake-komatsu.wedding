<template>
  <div class="absolute inset-0">
    <!-- Fill background to keep composition consistent on any aspect ratio -->
    <div
      class="absolute inset-0 -z-10 hidden md:block"
      :style="fillStyle"
      aria-hidden="true"
    />
    <transition-group name="fade" tag="div" class="relative h-full w-full">
      <NuxtImg
        v-for="(slide, i) in slides"
        v-show="i === current"
        :key="i + '-' + current"
        :src="slide.src"
        class="absolute inset-0 h-full w-full object-cover md:object-contain"
        :style="{ objectPosition: slide.position || defaultPosition }"
        sizes="(max-width: 768px) 100vw, 1400px"
        :alt="''"
        :loading="i === 0 ? 'eager' : 'lazy'"
        :fetchpriority="i === 0 ? 'high' : 'auto'"
        decoding="async"
        format="jpg"
        :quality="80"
      />
    </transition-group>
    <div class="absolute inset-0" aria-hidden="true"
         style="background: linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,.55) 65%, rgba(0,0,0,.65) 100%);"></div>
    <div class="pointer-events-none absolute inset-0" aria-hidden="true"
         style="background: radial-gradient(120% 80% at 50% 20%, rgba(0,0,0,0) 0%, rgba(0,0,0,.2) 70%, rgba(0,0,0,.35) 100%);"></div>
  </div>
  
</template>

<script setup lang="ts">
const $img = useImage()
type Slide = string | { src: string; position?: string }
const props = withDefaults(defineProps<{ images: Slide[]; interval?: number; defaultPosition?: string; fillMode?: 'solid' | 'blur' }>(), {
  images: () => ['/hero.jpg'],
  interval: 4000,
  defaultPosition: '50% 30%',
  fillMode: 'solid'
})

const defaultPosition = computed(() => props.defaultPosition)
const slides = computed(() => props.images.map((s) => typeof s === 'string' ? { src: s } : s))
const current = ref(0)

const fillStyle = computed(() => {
  if (props.fillMode === 'blur' && slides.value[current.value]) {
    const src = slides.value[current.value].src
    // Resolve via Nuxt Image to ensure browser-friendly format (e.g., HEIF -> JPG)
    const resolved = $img(src, { format: 'jpg', fit: 'cover', quality: 60 })
    return {
      backgroundImage: `url('${resolved || src}')`,
      backgroundSize: 'cover',
      backgroundPosition: slides.value[current.value].position || defaultPosition.value,
      filter: 'blur(22px) saturate(115%)',
      transform: 'scale(1.08)'
    } as any
  }
  // Solid royal navy fill
  return { backgroundColor: 'rgb(15 26 44)' } as any
})

let timer: any
onMounted(() => {
  if (props.images.length <= 1) return
  timer = setInterval(() => {
    current.value = (current.value + 1) % props.images.length
  }, props.interval)
})
onBeforeUnmount(() => clearInterval(timer))
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 800ms ease-in-out; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.kb { transform: scale(1.05); animation: kenburns 14s ease-in-out infinite alternate; }
@keyframes kenburns { from { transform: scale(1.05); } to { transform: scale(1.12); } }
</style>
