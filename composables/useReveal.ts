import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

export interface RevealOptions extends IntersectionObserverInit {
  once?: boolean
}

export const useReveal = (options: RevealOptions = {}) => {
  const target = ref<HTMLElement | null>(null)
  const isVisible = ref(false)
  let observer: IntersectionObserver | null = null

  const once = options.once ?? true
  const observerOptions: IntersectionObserverInit = {
    root: options.root ?? null,
    rootMargin: options.rootMargin ?? '0px',
    threshold: options.threshold ?? 0.2
  }

  onMounted(() => {
    if (typeof window === 'undefined') return

    observer = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (entry?.isIntersecting) {
        isVisible.value = true
        if (once && observer) {
          observer.disconnect()
        }
      } else if (!once) {
        isVisible.value = false
      }
    }, observerOptions)

    if (target.value) {
      observer.observe(target.value)
    }
  })

  onBeforeUnmount(() => {
    if (observer) {
      observer.disconnect()
    }
  })

  const setTarget = (el: HTMLElement | null) => {
    target.value = el
    if (el && observer) {
      observer.observe(el)
    }
  }

  return {
    target: target as Ref<HTMLElement | null>,
    setTarget,
    isVisible
  }
}
