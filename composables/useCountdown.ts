import { onBeforeUnmount, onMounted, ref } from 'vue'

export interface CountdownState {
  total: number
  days: number
  hours: number
  minutes: number
  seconds: number
}

export const useCountdown = (targetDate: Date) => {
  const state = ref<CountdownState>(calculateDiff(targetDate))
  let timer: ReturnType<typeof setInterval> | null = null

  const tick = () => {
    state.value = calculateDiff(targetDate)
  }

  onMounted(() => {
    timer = setInterval(tick, 1000)
  })

  onBeforeUnmount(() => {
    if (timer) {
      clearInterval(timer)
    }
  })

  return state
}

const calculateDiff = (targetDate: Date): CountdownState => {
  const now = new Date()
  const total = Math.max(0, targetDate.getTime() - now.getTime())

  const days = Math.floor(total / (1000 * 60 * 60 * 24))
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((total / (1000 * 60)) % 60)
  const seconds = Math.floor((total / 1000) % 60)

  return {
    total,
    days,
    hours,
    minutes,
    seconds
  }
}
