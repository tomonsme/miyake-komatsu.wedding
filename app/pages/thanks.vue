<template>
  <main class="flex min-h-screen items-center justify-center bg-royal px-6">
    <Motion
      class="w-full max-w-lg rounded-3xl bg-white p-10 text-center shadow-card"
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.6 }"
    >
      <h1 class="font-display text-3xl text-ink">Thank You</h1>
      <p class="mt-4 text-sm leading-relaxed text-ink/70">
        ご回答ありがとうございました<br>
        お会いできる日を 心より楽しみにしております
      </p>
      <NuxtLink to="/" class="btn mt-8">トップへ戻る</NuxtLink>
    </Motion>
  </main>
</template>
