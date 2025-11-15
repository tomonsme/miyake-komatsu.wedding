<template>
  <NuxtLayout>
    <main class="flex min-h-screen flex-col items-center justify-center bg-royal px-6 text-center">
      <Motion :initial="{ opacity: 0, y: 10 }" :animate="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4 }">
        <p class="text-sm uppercase tracking-[0.3em] text-gold">Oops</p>
        <h1 class="mt-3 font-display text-4xl text-ink">エラーが発生しました</h1>
        <p class="mt-4 text-sm text-ink/70">
          {{ error?.message || 'ページを再読み込みしても解決しない場合は 主催者までご連絡ください' }}
        </p>
        <NuxtLink to="/" class="btn mt-8">トップへ戻る</NuxtLink>
      </Motion>
    </main>
  </NuxtLayout>
</template>

<script setup lang="ts">
defineProps<{ error?: { message?: string } }>()
</script>
