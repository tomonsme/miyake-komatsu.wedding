<template>
  <main class="min-h-screen bg-royal"> <!-- 深い青の背景に統一 -->
    <section class="relative bg-royal text-white snap-start">
      <!-- Image frame: leave space below for date/names -->
      <div class="relative h-[62svh] sm:h-[66svh] md:h-auto md:aspect-[21/9] max-h-[800px] overflow-hidden grain">
        <HeroSlider :images="heroSlides" :default-position="'50% 32%'" :interval="3800" fill-mode="blur" />
        <!-- Fixed welcome overlay (front-most, pointer-events disabled) -->
        <div class="pointer-events-none absolute inset-0 z-30 grid place-items-center p-3 sm:p-4">
          <img v-if="welcomeOverlayUrl" :src="welcomeOverlayUrl" alt=""
               class="w-auto max-w-[62%] sm:max-w-[50%] md:max-w-[38%] lg:max-w-[32%] object-contain drop-shadow-[0_8px_28px_rgba(0,0,0,.45)]"
               style="filter: saturate(0.55) brightness(0.9) contrast(0.9); opacity: .82;"
               loading="eager" decoding="async" />
        </div>
        <!-- Overlay content sits inside image for一致したレイアウト -->
        <div class="absolute inset-0 z-10 flex items-end md:items-center">
          <Motion :initial="{ opacity: 0, y: 20 }" :animate="{ opacity: 1, y: 0 }" :transition="{ duration: 0.8 }" class="mx-auto w-full max-w-screen-md px-6 pb-6 md:pb-10 text-center">
            
            <p class="gold-title inline-block text-xs font-semibold uppercase tracking-[0.4em] leading-tight font-display antialiased bg-gradient-to-b from-[#F7EFD8] via-[#E6D6AA] to-[#C8A769] bg-clip-text text-transparent [text-shadow:_0_1px_6px_rgba(0,0,0,.35)]">Welcome to our WEDDING Reception</p>
            <h1 class="mt-2 font-display text-3xl sm:text-4xl md:text-5xl">{{ displayCouple }}</h1>
            <NuxtLink to="/#message" class="btn-primary btn-lg btn-icon mt-4 inline-block">
              メッセージへ
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
            </NuxtLink>
          </Motion>
        </div>
        <!-- Scroll cue -->
        <div class="scroll-cue" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"/></svg>
        </div>
      </div>
      <!-- Meta band (date & couple) -->
      <div class="relative z-20 mx-auto w-full max-w-screen-md px-6 pb-12 pt-8 text-center">
        <div v-if="monogramUrl" class="mx-auto mb-3 grid place-items-center">
          <img :src="monogramUrl" alt="monogram" class="h-10 w-auto opacity-90" loading="lazy" />
        </div>
        <p class="font-display text-3xl md:text-4xl tracking-[0.18em] text-white/95 text-shadow-soft leading-tight flex items-center justify-center">
          <span>{{ displayDateParts.date }}</span>
          <span class="ml-2 inline-block" style="position: relative; top: 3px; font-size: 0.72em; letter-spacing: 0.12em;">{{ displayDateParts.dow }}</span>
        </p>
        <p class="mt-2 text-3xl md:text-4xl font-display tracking-[0.12em] text-white/90 text-shadow-soft uppercase">{{ displayCouple }}</p>
      </div>
    </section>

    

    <section id="message" class="relative scroll-mt-40 md:scroll-mt-28 band-gold snap-start snap-always min-h-[100svh] border-t border-gold/20">
      <div class="mx-auto h-full w-full max-w-screen-lg grid place-items-center px-2 sm:px-4 py-0">
        <!-- White box (square corners) covering header + message, with gold double rails -->
        <div class="relative mx-auto w-[94%] sm:w-[92%] max-w-screen-md bg-white/95 p-12 md:p-14 lg:p-16 text-royal shadow-sm" :style="letterBoxStyle">
          <span class="absolute left-0 right-0 top-0 h-2 bg-gradient-to-b from-white/55 to-transparent" aria-hidden="true"></span>
          <!-- Elegant double rectangular gold frames (square corners) -->
          <!-- Two offset rectangles that cross at corners -->
          <span class="pointer-events-none absolute inset-[18px]" aria-hidden="true"
                style="border: 1.5px solid rgba(220,192,142,.88);"></span>
          <span class="pointer-events-none absolute inset-[18px] border border-[#DCC08E]/60" aria-hidden="true"
          ></span>
          <header class="mb-4 md:mb-6 text-center">
            <h2 class="mt-0 text-2xl md:text-3xl font-display tracking-wide text-gold uppercase foil-text">MESSAGE</h2>
            <div class="my-2 flex items-center justify-center gap-8">
              <span class="block h-[2px] w-16 bg-[#DCC08E]/80"></span>
              <span class="block h-[2px] w-16 bg-[#DCC08E]/80"></span>
            </div>
            <p class="mt-1 text-xs text-royal/70">ご挨拶</p>
            <LeafDivider />
          </header>
          <div
            ref="messageContentWrap"
            class="mx-auto mt-4 md:mt-6 mb-4 md:mb-6 max-w-[60ch] sm:max-w-[54ch] md:max-w-[46ch] text-center message-content"
            :style="messageContentStyle"
          >
            <!-- 謹啓（左寄せ） -->
            <p v-if="parts.startLine" class="font-display leading-relaxed tracking-normal text-left text-royal/90 mb-4 md:mb-5" v-html="widowSafe(parts.startLine)"></p>

            <!-- 本文（改行維持・中央寄せ） -->
            <div class="text-center message-paras">
              <p
                v-for="(para, i) in bodyBlocks"
                :key="i"
                class="font-display leading-[1.9] md:leading-[2.3] tracking-normal text-royal/90"
                style="text-wrap: balance; text-wrap: pretty;"
                v-html="widowSafe(para)"
              ></p>
            </div>

            <!-- 謹白（右寄せ） -->
            <p v-if="parts.endLine" class="font-display leading-relaxed tracking-normal text-right text-royal/90 mt-6 md:mt-7" v-html="widowSafe(parts.endLine)"></p>

            <!-- お名前（中央寄せ） -->
            <div v-if="parts.nameLines.length" class="mt-3 md:mt-4 text-center text-royal/90">
              <p v-for="(nm, i) in parts.nameLines" :key="i" class="font-display leading-relaxed tracking-normal" v-html="widowSafe(nm)"></p>
            </div>
          </div>
        </div>
      </div>

      <!-- Couple Intro moved to dedicated Profile section below -->
    </section>

    <!-- Profile section (縦並び) -->
    <section id="profile" class="mx-auto w-full max-w-screen-md scroll-mt-32 md:scroll-mt-24 px-6 pt-12 pb-20 md:pt-16 md:pb-28 snap-start min-h-[100svh] md:min-h-fit border-t border-gold/20">
      <header class="mb-6 text-center">
        <h2 class="mt-0 text-2xl font-display tracking-wide text-gold uppercase foil-text">PROFILE</h2>
        <div class="my-2 flex items-center justify-center gap-8">
          <span class="block h-[2px] w-16 bg-[#DCC08E]/80"></span>
          <span class="block h-[2px] w-16 bg-[#DCC08E]/80"></span>
        </div>
        <p class="mt-1 text-xs text-white/70">ご紹介</p>
        <LeafDivider />
      </header>
      <div class="grid gap-6">
        <!-- Groom -->
        <div class="luxe-card fade-in-soft">
          <div class="luxe-card__inner">
            <div class="flex items-center gap-5 md:gap-8 pl-0">
              <div v-if="groomPhotoUrl" class="h-28 w-28 md:h-40 md:w-40 overflow-hidden rounded-full ring-2 ring-champagne/60 shrink-0">
                <img :src="groomPhotoUrl" alt="新郎写真" class="h-full w-full object-cover scale-[1.15] md:scale-[1.25] transition-transform duration-300" />
              </div>
              <div class="leading-relaxed">
                <p class="text-xs font-semibold uppercase tracking-[0.08em] text-white/70">GROOM / 新郎</p>
                <p class="mt-1 text-xl md:text-2xl font-semibold font-serif leading-relaxed text-white/95">{{ groomName }}</p>
              </div>
            </div>
            <p v-if="groomIntro" class="mt-3 text-sm leading-relaxed text-white/90 wrap-nice">{{ groomIntro }}</p>
            <p v-if="groomMessage" class="mt-3 text-sm leading-relaxed whitespace-pre-line text-white/90 wrap-nice">{{ groomMessage }}</p>
          </div>
        </div>

        <!-- Bride (photo on the right) -->
        <div class="luxe-card fade-in-soft">
          <div class="luxe-card__inner">
            <div class="flex flex-row-reverse items-center gap-5 md:gap-8 pl-0">
              <div v-if="bridePhotoUrl" class="h-28 w-28 md:h-40 md:w-40 overflow-hidden rounded-full ring-2 ring-champagne/60 shrink-0">
                <img :src="bridePhotoUrl" alt="新婦写真" class="h-full w-full object-cover object-[50%_35%] scale-150 md:scale-[1.7] transition-transform duration-300" />
              </div>
              <div class="leading-relaxed">
                <p class="text-xs font-semibold uppercase tracking-[0.08em] text-white/70">BRIDE / 新婦</p>
                <p class="mt-1 text-xl md:text-2xl font-semibold font-serif leading-relaxed text-white/95">{{ brideName }}</p>
              </div>
            </div>
            <p v-if="brideIntro" class="mt-3 text-sm leading-relaxed text-white/90 wrap-nice">{{ brideIntro }}</p>
            <p v-if="brideMessage" class="mt-3 text-sm leading-relaxed whitespace-pre-line text-white/90 wrap-nice">{{ brideMessage }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Countdown (moved below profile) -->
    <section v-if="hasValidDate" id="countdown" class="relative scroll-mt-40 md:scroll-mt-28 band-photo snap-start snap-always border-t border-gold/20" :style="{ backgroundImage: `url('${countdownBg}')` }"> 
      <div class="relative mx-auto w-full max-w-screen-md px-6 py-12">
        <header class="mb-6 text-center">
        <h2 class="mt-0 text-2xl md:text-3xl font-display tracking-wide text-gold uppercase foil-text">COUNTDOWN</h2>
          <div class="my-2 flex items-center justify-center gap-8">
            <span class="block h-[2px] w-16 bg-[#DCC08E]/80"></span>
            <span class="block h-[2px] w-16 bg-[#DCC08E]/80"></span>
          </div>
          <p class="mt-1 text-xs text-white/80">当日まで</p>
          <LeafDivider />
        </header>
        <div class="grid grid-cols-4 gap-6 md:gap-8">
          <div class="counter"><div class="counter__inner">
            <p class="counter__num font-display">{{ timeLeft.days }}</p>
            <p class="counter__label text-[10px] md:text-xs">Days</p>
          </div></div>
          <div class="counter"><div class="counter__inner">
            <p class="counter__num font-display">{{ timeLeft.hours }}</p>
            <p class="counter__label text-[10px] md:text-xs">Hours</p>
          </div></div>
          <div class="counter"><div class="counter__inner">
            <p class="counter__num font-display">{{ timeLeft.minutes }}</p>
            <p class="counter__label text-[10px] md:text-xs">Minutes</p>
          </div></div>
          <div class="counter"><div class="counter__inner">
            <p class="counter__num font-display">{{ timeLeft.seconds }}</p>
            <p class="counter__label text-[10px] md:text-xs">Seconds</p>
          </div></div>
        </div>
        <p class="mt-4 text-center text-sm text-gold/90 text-glow">to {{ toDateLabel }}</p>
      </div>
    </section>

    <section id="events" class="mx-auto w-full max-w-screen-md scroll-mt-40 md:scroll-mt-28 px-6 pt-12 pb-20 md:pt-16 md:pb-28 snap-start snap-always border-t border-gold/20">
      <header class="mb-6 text-center">
        <h2 class="mt-0 text-2xl font-display tracking-wide text-gold uppercase foil-text">INFORMATION</h2>
        <div class="my-2 flex items-center justify-center gap-8">
          <span class="block h-[2px] w-16 bg-[#DCC08E]/80"></span>
          <span class="block h-[2px] w-16 bg-[#DCC08E]/80"></span>
        </div>
        <p class="mt-1 text-xs text-white/70">ご案内</p>
        <LeafDivider />
      </header>
      <div class="grid gap-6">
        <!-- Summary sheet with deco corners -->
        <div class="luxe-card fade-in-soft">
          <div class="luxe-card__inner">
            <dl class="mx-auto grid max-w-lg grid-cols-[5.5rem_1fr] md:grid-cols-[6.25rem_1fr] gap-y-1.5 gap-x-3 text-base md:text-lg">
              <dt class="text-white/70 tracking-wide leading-snug">日　時</dt><dd class="text-white/90 leading-snug nums-unified">{{ dateLabel }}</dd>
              <div class="col-span-2 h-px bg-[#DCC08E]/25 my-1"></div>
              <dt class="text-white/70 tracking-wide leading-snug">受　付</dt><dd class="text-white/90 leading-snug nums-unified">{{ receptionOpenTime || '—' }}</dd>
              <div class="col-span-2 h-px bg-[#DCC08E]/25 my-1"></div>
              <template v-if="ceremonyTime">
                <dt class="text-white/70 tracking-wide leading-snug">挙　式</dt>
                <dd class="text-white/90 leading-snug nums-unified">{{ ceremonyTime }}</dd>
                <div class="col-span-2 h-px bg-[#DCC08E]/25 my-1"></div>
              </template>
              <dt class="text-white/70 tracking-wide leading-snug">披露宴</dt><dd class="text-white/90 leading-snug nums-unified">{{ receptionTime || '—' }}</dd>
              <div class="col-span-2 h-px bg-[#DCC08E]/25 my-1"></div>
              <dt class="text-white/70 tracking-wide leading-snug">場　所</dt><dd class="text-white/90 leading-snug wrap-nice" v-html="placeDisplayBr"></dd>
              <div class="col-span-2 h-px bg-[#DCC08E]/25 my-1"></div>
              <dt class="text-white/70 tracking-wide leading-snug">住　所</dt>
              <dd class="text-white/90 leading-snug nums-unified wrap-nice">
                <template v-if="mapPlaceUrl">
                  <a :href="mapPlaceUrl" target="_blank" rel="noopener" class="underline decoration-[#DCC08E]/40 underline-offset-4 hover:text-[#DCC08E]" v-html="venueAddressBr"></a>
                </template>
                <template v-else><span v-html="venueAddressBr"></span></template>
              </dd>
              <div class="col-span-2 h-px bg-[#DCC08E]/25 my-3"></div>
              <dt class="text-white/70 tracking-wide leading-snug">電話番号</dt><dd class="text-white/90 leading-snug nums-unified">{{ venuePhoneDisplay }}</dd>
            </dl>
          </div>
        </div>

        <!-- Map -->
        <div class="luxe-card fade-in-soft"><div class="luxe-card__inner text-center">
          <div class="mt-2 mx-auto max-w-md overflow-hidden rounded-xl ring-1 ring-gold/30" v-if="mapEmbedUrl">
            <iframe
              :src="mapEmbedUrl"
              width="100%"
              height="300"
              style="border:0"
              allowfullscreen=""
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              title="Google Map - 会場"
            ></iframe>
          </div>
          <div class="mt-4 mx-auto max-w-md" v-else>
            <p class="text-sm text-white/70">地図URLが未設定です</p>
          </div>
        </div></div>

        <!-- Access + Parking (condensed) -->
        <div class="luxe-card fade-in-soft"><div class="luxe-card__inner">
          <p class="text-sm font-semibold text-white/90">会場までのアクセスについて</p>
          <ul class="mt-2 list-disc space-y-1 pl-6 text-sm text-white/80">
            <li>JR大阪駅 西改札口より徒歩4分</li>
            <li>大阪メトロ四ツ橋線 西梅田駅より徒歩5分</li>
            <li>阪神電鉄 大阪梅田駅より徒歩5分</li>
            <li>
              <span>JR新大阪駅から 約12分（JR東海道線）</span>
              <span class="block text-xs text-white/65">大阪駅（西改札口）より徒歩4分</span>
            </li>
          </ul>
          <div class="mt-4 border-t border-champagne/50 pt-3">
            <p class="text-sm font-semibold text-white/90">駐車場のご案内</p>
            <p class="mt-2 text-sm text-white/80">ホテル地下駐車場をご利用ください</p>
            <p class="mt-1 text-sm text-white/80 whitespace-pre-line">優待券をご用意しておりますので\nお引き上げの際はクロークスタッフへお申し出ください</p>
            <ul class="mt-1 pl-5 text-xs text-white/70 list-disc space-y-1">
              <li>収容台数に限りがございます</li>
              <li>混雑時は周辺駐車場をご案内する場合がございます</li>
            </ul>
          </div>
        </div></div>
      </div>
    </section>

    <!-- Access section unified into Information above -->

    <!-- ご案内セクションは不要のため削除し、駐車場はAccessへ移設 -->

    <section id="rsvp" class="mx-auto w-full max-w-screen-md scroll-mt-40 md:scroll-mt-28 px-6 pt-10 pb-8 md:pt-14 md:pb-12 snap-start snap-always border-t border-gold/20">
      <!-- Section header aligned with other sections -->
      <header class="mb-6 text-center">
        <h2 class="mt-0 text-2xl font-display tracking-wide text-gold uppercase foil-text">RSVP</h2>
        <div class="my-2 flex items-center justify-center gap-8">
          <span class="block h-[2px] w-16 bg-[#DCC08E]/80"></span>
          <span class="block h-[2px] w-16 bg-[#DCC08E]/80"></span>
        </div>
        <p class="mt-1 text-xs text-white/70">ご出欠のご回答</p>
        <LeafDivider />
      </header>

      <div class="panel-navy panel-navy--flat fade-in-soft mx-auto max-w-lg">
        <div class="panel__inner text-center pt-4 pb-2 md:pt-6 md:pb-3">
          <p
            class="text-sm leading-relaxed text-white/90 wrap-nice whitespace-pre-line"
            v-html="widowSafe('ご多用のところ 誠に恐れ入りますが\n下記の期日までに ご出欠の旨をご登録くださいますようお願い申し上げます')"
          ></p>
          <p v-if="hasValidDate" class="mt-2 text-sm leading-relaxed text-white/90 wrap-nice">
            <span class="text-white/65 tracking-wide">ご回答期限：</span>
            <span class="ml-1 nums-unified text-lg text-gold">{{ rsvpDateHuman }}</span>
            <span class="ml-1">まで</span>
          </p>
          <button type="button" class="btn-callout btn-lg btn-icon mt-3" @click="openRsvp()" aria-label="ご出欠のご回答フォームを開く">
            招待状に回答する
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </section>

    <!-- RSVP Modal -->
    <div v-if="rsvpOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4" @keydown.esc="closeRsvp" tabindex="-1" role="dialog" aria-modal="true" :aria-labelledby="'rsvp-title'">
      <div class="absolute inset-0 bg-royal/80 backdrop-blur-sm" @click="closeRsvp" aria-hidden="true"></div>
      <!-- Center toast for draft feedback -->
      <div v-if="draftStatus==='saved' || draftStatus==='cleared'" class="pointer-events-none fixed inset-0 z-[60] grid place-items-center">
        <div class="toast-center">{{ draftStatus==='cleared' ? '下書きを削除しました（入力はそのままです）' : '下書きを保存しました' }}</div>
      </div>
      <div class="relative z-10 w-full max-w-screen-md modal-panel">
        <div class="letter letter--navy fade-in-soft">
          <div class="letter__inner">
            <button
              type="button"
              class="pointer-events-auto absolute right-2 top-2 md:right-3 md:top-3 z-10 grid h-11 w-11 place-items-center rounded-full text-white/80 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/80"
              @click="closeRsvp"
              aria-label="閉じる"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            
            <header class="letter__header">
              <p class="letter__eyebrow">RSVP</p>
              <h2 class="letter__title" id="rsvp-title">ご出欠のご回答</h2>
              <div class="letter__divider"></div>
            </header>

            <div v-if="publicConfig.rsvpMode === 'google' && publicConfig.googleFormEmbedUrl" class="mt-4 overflow-hidden rounded-xl" style="height: 680px;">
              <iframe
                class="h-full w-full"
                :src="publicConfig.googleFormEmbedUrl"
                frameborder="0"
                marginheight="0"
                marginwidth="0"
                >読み込んでいます…</iframe>
            </div>

            <form v-else class="mt-4 grid gap-6" @submit.prevent="submitRsvp" aria-labelledby="rsvp-title">
              <!-- まず出欠を選ぶ -->
              <p class="text-center text-sm text-white/80">お手数ではございますが　出席情報のご登録をお願い申し上げます</p>
              <!-- Draft toolbar -->
              <div class="mx-auto mb-1 flex max-w-md items-center justify-center gap-3 text-xs text-white/60">
                <span v-if="draftStatus==='restored'">下書きを読み込みました</span>
                <span v-else-if="draftStatus==='saved'">下書きを保存しました</span>
                <span v-else>自動で下書き保存されます</span>
                <button type="button" class="underline decoration-white/30 underline-offset-4 hover:text-white" @click="clearDraft">下書きを削除</button>
              </div>
              <div class="flex items-center justify-center mt-2" role="group" aria-label="出欠選択">
                <div class="choice-toggle">
                  <button type="button" @click="form.attendance = 'attending'"
                    class="rsvp-choice rsvp-choice--attend h-11 md:h-12 px-7 text-base"
                    :class="{ 'is-active': form.attendance === 'attending' }"
                    :aria-pressed="form.attendance === 'attending'"
                    aria-label="ご出席を選択"><span class="rsvp-choice__label">ご出席</span></button>
                  <button type="button" @click="form.attendance = 'declining'"
                    class="rsvp-choice rsvp-choice--decline h-11 md:h-12 px-7 text-base"
                    :class="{ 'is-active': form.attendance === 'declining' }"
                    :aria-pressed="form.attendance === 'declining'"
                    aria-label="ご欠席を選択"><span class="rsvp-choice__label">ご欠席</span></button>
                </div>
              </div>

              <!-- 出席の場合のみフォーム表示 -->
              <template v-if="form.attendance === 'attending'">
                <div class="grid gap-4 md:grid-cols-2">
                  <label class="field">
                    <span class="field__label">お名前</span>
                    <input v-model="form.name" type="text" class="field__control" required aria-required="true" placeholder="例）山田 太郎" />
                  </label>
                  <label class="field">
                    <span class="field__label">メールアドレス</span>
                    <input v-model="form.email" type="email" class="field__control" required aria-required="true" placeholder="例）taro@example.com" />
                  </label>
                </div>

                <div class="grid gap-4 md:grid-cols-3">
                  <label class="field md:col-span-1">
                    <span class="field__label">郵便番号（任意）</span>
                    <input v-model="form.postalCode" type="text" inputmode="numeric" pattern="[0-9\-]*" class="field__control" placeholder="例）123-4567" />
                  </label>
                  <label class="field md:col-span-2">
                    <span class="field__label">ご住所（任意）</span>
                    <input v-model="form.address1" type="text" class="field__control" placeholder="例）大阪府大阪市北区梅田2-5-25" />
                  </label>
                </div>
                <label class="field">
                  <span class="field__label">建物名・号室（任意）</span>
                  <input v-model="form.address2" type="text" class="field__control" placeholder="例）○○マンション 101号室" />
                </label>

                <label class="field">
                  <span class="field__label">お飲み物</span>
                  <select v-model="form.alcohol" class="field__control">
                    <option value="ok">アルコール可</option>
                    <option value="no">アルコール不可</option>
                  </select>
                </label>

                <label class="field">
                  <span class="field__label">アレルギー・苦手な食材（任意）</span>
                  <textarea v-model="form.dietaryRestrictions" rows="2" class="field__control" placeholder="例）甲殻類アレルギー／生魚が苦手 など"></textarea>
                </label>

                <div class="grid gap-4 md:grid-cols-2">
                  <label class="field">
                    <span class="field__label">電話番号（任意）</span>
                    <input v-model="form.phone" type="tel" inputmode="tel" class="field__control" placeholder="例）090-1234-5678" />
                  </label>
                </div>

                <label class="field">
                  <span class="field__label">メッセージ（任意）</span>
                  <textarea v-model="form.message" rows="3" class="field__control" placeholder="ご要望などございましたらご自由にお書きください"></textarea>
                  <span class="field__hint whitespace-pre-line">送信後の変更も承ります\nご遠慮なくお知らせください</span>
                </label>

                <div class="grid gap-2">
                  <span class="field__label">写真の共有（任意 最大10枚・各10MBまで）</span>
                  <div class="flex flex-wrap gap-2">
                    <label class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-champagne/60 bg-white/5 px-4 py-3 text-sm text-white/85 hover:bg-white/10">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
                      <span>写真を選択</span>
                      <input type="file" accept="image/*" multiple class="hidden" @change="onPhotoSelect" />
                    </label>
                  </div>
                  <div v-if="photoFiles.length" class="mt-2 flex flex-wrap gap-3">
                    <div v-for="(f,i) in photoFiles" :key="i" class="relative overflow-hidden rounded-lg border border-champagne/40 bg-white/5">
                      <img :src="photoPreviews[i]" :alt="f.name" class="h-20 w-20 object-cover" />
                      <button type="button" class="absolute right-1 top-1 rounded-full bg-royal/70 p-1 text-white/80 hover:bg-royal/90" @click="removePhotoAt(i)" aria-label="削除">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    </div>
                  </div>
                  <span class="field__hint whitespace-pre-line">ご提供いただいた写真は\n当日のスライド等に使用させていただく場合がございます</span>
                </div>

                <div class="mt-2 grid gap-2 text-center md:flex md:flex-col md:items-center md:justify-center">
                  <div class="order-2 md:order-2">
                    <p class="text-xs text-white/70 whitespace-pre-line">ご返信期日:\n披露宴の1ヶ月前までを目安にお願いいたします</p>
                    <p class="sr-only" aria-live="polite">{{ draftStatus==='saved' ? '下書きを保存しました' : (draftStatus==='restored' ? '下書きを読み込みました' : (draftStatus==='cleared' ? '下書きを削除しました' : '')) }}</p>
                  </div>
                  <div class="order-1 md:order-1 flex w-full justify-center flex-col gap-2 sm:flex-row md:w-auto">
                    <button type="submit" class="btn-gold btn-lg w-full sm:w-auto" :disabled="isSubmitting">{{ isSubmitting ? '送信中…' : (rsvpStatus === 'ok' ? '変更を再送信' : '送信') }}</button>
                  </div>
                </div>
              </template>

              <!-- 欠席の場合は誤操作防止の確定を要求 -->
              <template v-else-if="form.attendance === 'declining'">
                <div class="mx-auto max-w-sm space-y-4 text-center">
                  <p class="text-sm text-white/85 whitespace-pre-line">誤操作防止のため\n確認の上で確定してください</p>
                  <label class="inline-flex cursor-pointer items-center justify-center gap-2 text-sm text-white/85">
                    <input type="checkbox" v-model="declineConfirm" class="h-4 w-4 rounded border-champagne/60 text-gold focus:ring-gold" />
                    <span>ご欠席にて確定します</span>
                  </label>
                  <div class="flex w-full justify-center flex-col gap-2 sm:flex-row md:w-auto">
                    <button type="submit" class="btn-gold btn-lg w-full sm:w-auto" :disabled="!declineConfirm || isSubmitting">{{ isSubmitting ? '送信中…' : (rsvpStatus === 'ok' ? 'ご欠席を再送信' : 'ご欠席を送信') }}</button>
                  </div>
                </div>
              </template>

              <p v-if="rsvpStatus === 'ok'" class="alert alert-ok whitespace-pre-line" role="status" aria-live="polite">送信しました\nありがとうございました</p>
              <p v-if="rsvpStatus === 'error'" class="alert alert-error whitespace-pre-line" role="status" aria-live="polite">送信に失敗しました\n時間を置いて再度お試しください</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  </main>
  
</template>

<script setup lang="ts">
import LeafDivider from '../../components/LeafDivider.vue'
// Explicit relative import to ensure resolution works consistently
import HeroSlider from '../../components/HeroSlider.vue'
type InvitationConfig = {
  couple?: string
  eventDateIso?: string
  venueName?: string
  venueAddress?: string
  googleMapUrl?: string
  venueLat?: number
  venueLng?: number
  venuePhone?: string
  venueUrl?: string
  headerCrestUrl?: string
  groomPhotoUrl?: string
  bridePhotoUrl?: string
  message?: string
  groomName?: string
  brideName?: string
  groomIntro?: string
  brideIntro?: string
  groomMessage?: string
  brideMessage?: string
}

const cfg = useAppConfig() as { invitation?: InvitationConfig }
const invitation = cfg.invitation ?? {}

// Defaults to ensure graceful display even if app.config hot-reload未反映
const DEFAULT_VENUE = 'ザ・リッツ・カールトン大阪'
const DEFAULT_ADDR = '大阪府大阪市北区梅田2-5-25'
const DEFAULT_PHONE = '06-6343-7000'
const DEFAULT_URL = 'https://modules.marriott.com/wedding-fair/jp/osarz-the-ritz-carlton-osaka'
const DEFAULT_MAP = 'https://www.google.com/maps?hl=ja&q=大阪府大阪市北区梅田2-5-25&z=16&output=embed'

// Ensure couple displays even if app.config hot-reload not applied yet
const couple = (invitation.couple && invitation.couple.trim()) ? (invitation.couple as string) : 'Tomoya & Mihono'
const venue = invitation.venueName || DEFAULT_VENUE
const venuePhoneRaw = (invitation as any).venuePhone
const venuePhoneDisplay = (venuePhoneRaw && venuePhoneRaw !== '—') ? venuePhoneRaw : DEFAULT_PHONE
const venueUrl = (invitation as any).venueUrl || DEFAULT_URL
const venueAddress = invitation.venueAddress || DEFAULT_ADDR
const googleMapUrl = invitation.googleMapUrl || DEFAULT_MAP
const venueLat = Number((invitation as any).venueLat) || NaN
const venueLng = Number((invitation as any).venueLng) || NaN
// image placeholders for now; replace later from app.config
const headerCrestUrl = (invitation as any).headerCrestUrl || '/favicon.png'
const monogramUrl = (invitation as any).monogramUrl || ''
// Cache-bust helpers to ensure latest images show even with IPX/browser cache
function withBust(u?: string) {
  if (!u) return u as any
  const sep = u.includes('?') ? '&' : '?'
  const v = import.meta && (import.meta as any).env && (import.meta as any).env.DEV ? Date.now() : '20251004'
  return `${u}${sep}v=${v}`
}
const groomPhotoUrl = withBust((invitation as any).groomPhotoUrl || '/groom.JPG')
const bridePhotoUrl = withBust((invitation as any).bridePhotoUrl || '/bride.JPG')
const countdownBg = (invitation as any).countdownBgUrl || '/countdown1.jpg'
const welcomeOverlayUrl = (invitation as any).welcomeOverlayUrl || '/welcome-overlay.png'
// Prefer a human-friendly place name; if venueName looks like an address, try to extract from googleMapUrl
function extractPlaceFromGoogleUrl(u?: string) {
  try {
    if (!u) return ''
    const url = new URL(u)
    const q = url.searchParams.get('query') || url.searchParams.get('q') || ''
    if (q && !/^\d+\.\d+,\d+\.\d+$/.test(q)) return decodeURIComponent(q)
  } catch {}
  return ''
}
const placeDisplay = (() => {
  const name = invitation.venueName || ''
  const looksAddress = /^〒/.test(name) || /丁目/.test(name)
  if (looksAddress) return extractPlaceFromGoogleUrl(googleMapUrl) || DEFAULT_VENUE
  return name || DEFAULT_VENUE
})()
// Robust Google Maps URLs: separate link (place) and embed
function buildPlaceUrl(name?: string, addr?: string, lat?: number, lng?: number) {
  if (Number.isFinite(lat as number) && Number.isFinite(lng as number)) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
  }
  const q = encodeURIComponent([name || '', addr || ''].filter(Boolean).join(' ').trim())
  if (!q) return ''
  return `https://www.google.com/maps/search/?api=1&query=${q}`
}
function buildEmbedUrlFrom(placeUrl: string, fallbackName?: string, fallbackAddr?: string, lat?: number, lng?: number) {
  // Build a legacy embed URL that works without API key
  // Use maps.google.com with /maps and output=embed to avoid redirect/X-Frame issues
  try {
    const u = new URL(placeUrl)
    const q = u.searchParams.get('query') || u.searchParams.get('q') || ''
    if (q) return `https://www.google.com/maps?q=${encodeURIComponent(q)}&hl=ja&z=16&output=embed`
  } catch {}
  if (Number.isFinite(lat as number) && Number.isFinite(lng as number)) {
    return `https://www.google.com/maps?q=${lat},${lng}&hl=ja&z=16&output=embed`
  }
  const q2 = encodeURIComponent([fallbackName || '', fallbackAddr || ''].filter(Boolean).join(' ').trim())
  if (!q2) return ''
  return `https://www.google.com/maps?q=${q2}&hl=ja&z=16&output=embed`
}
const mapPlaceUrl = (() => {
  // Prefer explicit query from provided map URL (even if it's an embed)
  if (googleMapUrl) {
    try {
      const u = new URL(googleMapUrl)
      const q = u.searchParams.get('query') || u.searchParams.get('q') || ''
      const ll = u.searchParams.get('ll') || ''
      if (q) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`
      if (ll && /,/.test(ll)) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ll)}`
    } catch {}
  }
  // Fallback to name/address or coordinates
  return buildPlaceUrl(venue, venueAddress, venueLat, venueLng)
})()
const mapEmbedUrl = (() => {
  // If explicitly provided and already an embed with pb param, use as-is
  if (googleMapUrl && /\/maps\/embed/.test(googleMapUrl)) return googleMapUrl
  // If provided as www.google.com...&output=embed, normalize to maps.google.com/maps?... to avoid top-level redirect inside iframe
  if (googleMapUrl && /output=embed/.test(googleMapUrl)) {
    try {
      const u = new URL(googleMapUrl)
      const q = u.searchParams.get('query') || u.searchParams.get('q') || ''
      if (q) return `https://www.google.com/maps?q=${encodeURIComponent(q)}&hl=ja&z=16&output=embed`
    } catch {}
  }
  const place = mapPlaceUrl || buildPlaceUrl(venue, venueAddress, venueLat, venueLng)
  return buildEmbedUrlFrom(place, venue, venueAddress, venueLat, venueLng)
})()

// RSVP: 欠席の誤操作防止用チェック
const declineConfirm = ref(false)
const rawMessage = (invitation.message ?? '').trim()
const messageText: string = /\{\{.*\}\}/.test(rawMessage) || rawMessage === ''
  ? `皆様いかがお過ごしでしょうか\n\nこのたび披露宴を執り行うこととなりました\n日頃お世話になっております皆様に私どもの門出をお見守りいただきたく\nささやかながら小宴を催したく存じます\n\nご多用中誠に恐縮ではございますが ぜひご出席いただきたくご案内申し上げます`
  : rawMessage

// Display-only: if the first one or two lines are 見出し「ご挨拶」, drop them to avoid duplicate heading in the card
function fwToAscii(s: string) {
  return s.replace(/[\uFF01-\uFF5E]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
}
const messageDisplay = computed(() => {
  const lines = messageText.split(/\r?\n/)
  while (lines.length) {
    const raw = lines[0].trim()
    const headJ = raw.replace(/\s/g, '')
    const headE = fwToAscii(raw).trim().toLowerCase()
    if (headJ === '' || headJ === 'ご挨拶' || headE === 'message') {
      lines.shift()
      continue
    }
    break
  }
  return lines.join('\n')
})

// 「謹啓〜謹白＋名前」パターンを分割して整形
const parts = computed(() => {
  const all = messageDisplay.value.split(/\r?\n/)
  // 先頭空行除去
  let i = 0
  while (i < all.length && all[i].trim() === '') i++
  let startLine = ''
  if (i < all.length && /^(謹啓|拝啓)$/.test(all[i].trim())) {
    startLine = all[i].trim()
    i++
  }
  // 謹白位置を探索
  let j = all.length - 1
  // 末尾空行除去
  while (j >= i && all[j].trim() === '') j--
  let endIndex = -1
  for (let k = i; k <= j; k++) {
    if (/^謹白$/.test(all[k].trim())) { endIndex = k; break }
  }
  const bodyLines = endIndex >= i ? all.slice(i, endIndex) : all.slice(i, j + 1)
  const endLine = endIndex >= i ? '謹白' : ''
  const nameLines = endIndex >= 0 ? all.slice(endIndex + 1).filter(l => l.trim() !== '') : []
  return {
    startLine,
    bodyText: bodyLines.join('\n'),
    endLine,
    nameLines
  }
})

// 本文の段落化（空行で段落分割。行内改行は連結し、ブラウザに最適折返しを任せる）
const bodyParas = computed(() => {
  const raw = parts.value.bodyText || ''
  // 2つ以上の改行で段落分け。段落内の単独改行は削除。
  return raw
    .split(/\r?\n\s*\r?\n+/)
    .map(p => p.replace(/\r?\n/g, '').trim())
    .filter(Boolean)
})

// 段落を読みやすいブロック（基本1文ずつ）に分割
const bodyBlocks = computed(() => {
  const blocks: string[] = []
  const paras = bodyParas.value

  // 句読点がない場合は、元の bodyText の改行単位をそのまま使う
  const hasPunctuation = paras.some(p => /[。！？]/.test(p))
  if (!hasPunctuation) {
    const lines = (parts.value.bodyText || '')
      .split(/\r?\n/)
      .map(l => l.replace(/\s+/g, ' ').trim())
      .filter(Boolean)
    blocks.push(...lines)
    return blocks
  }

  // 通常は句点ごとに区切って 1 文 1 行に整形
  for (const para of paras) {
    const sents: string[] = []
    let cur = ''
    for (const ch of para) {
      cur += ch
      if (/^[。！？]$/.test(ch)) {
        const t = cur.trim()
        if (t) sents.push(t)
        cur = ''
      }
    }
    const rest = cur.trim()
    if (rest) sents.push(rest)
    for (const s of sents) {
      const t = s.replace(/\s+/g, ' ').trim()
      if (t) blocks.push(t)
    }
  }
  return blocks
})

// Couple names (fallback: split from couple string)
const [derivedGroom, derivedBride] = (() => {
  if (!couple) return ['', '']
  const parts = couple.split(/\s*[&＆と・]\s*/)
  if (parts.length >= 2) return [parts[0], parts[1]]
  return [couple, '']
})()

const groomName = invitation.groomName || derivedGroom || '新郎'
const brideName = invitation.brideName || derivedBride || '新婦'
const displayCouple = (invitation.couple && invitation.couple.trim())
  ? (invitation.couple as string)
  : `${groomName}${brideName ? ' & ' + brideName : ''}`

// Short intros and messages (customizable via app.config.ts)
const groomIntro = (invitation.groomIntro || '').trim()
const brideIntro = (invitation.brideIntro || '').trim()
const groomMessage = (invitation.groomMessage || 'ささやかながら感謝をお伝えする一日にできればと思っています\nお時間が許せばぜひご参列ください！').trim()
const brideMessage = (invitation.brideMessage || '大好きな皆さまと素敵な時間を過ごせることを楽しみにしております！\n日々大感謝！').trim()

// Optional times (if set in app.config.ts)
const ceremonyTime = (invitation as any).ceremonyTime || ''
const receptionTime = (invitation as any).receptionTime || ''
const receptionOpenTime = (invitation as any).receptionOpenTime || ''
const DEFAULT_EVENT_DATE = '2026-02-07'

function parseLocalDate(iso?: string) {
  if (!iso) return null
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(iso)
  if (!m) return null
  const y = Number(m[1])
  const mo = Number(m[2]) - 1
  const d = Number(m[3])
  return new Date(y, mo, d)
}

const dateLabel = (() => {
  const d = parseLocalDate(invitation.eventDateIso || DEFAULT_EVENT_DATE)
  if (!d || Number.isNaN(d.getTime())) return '日付未設定'
  return new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short', timeZone: 'Asia/Tokyo' }).format(d)
})()

const displayDate = computed(() => {
  const d = parseLocalDate(invitation.eventDateIso || DEFAULT_EVENT_DATE)
  if (!d || Number.isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const wd = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'Asia/Tokyo' }).format(d).toUpperCase()
  return `${y}.${m}.${day} ${wd}`
})

// Split date and weekday for precise baseline alignment in UI
const displayDateParts = computed(() => {
  const d = parseLocalDate(invitation.eventDateIso || DEFAULT_EVENT_DATE)
  if (!d || Number.isNaN(d.getTime())) return { date: '', dow: '' }
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const dow = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'Asia/Tokyo' }).format(d)
  return { date: `${y}.${m}.${day}`, dow: `${dow}.` }
})

// RSVP deadline label (date only). Prefer invitation.rsvpDeadlineIso; fallback to event date.
const rsvpDateHuman = computed(() => {
  const deadlineIso = (invitation as any).rsvpDeadlineIso as string | undefined
  const make = (d: Date | null) => {
    if (!d || Number.isNaN(d.getTime())) return ''
    const y = d.getFullYear()
    const m = d.getMonth() + 1
    const day = d.getDate()
    return `${y}年${m}月${day}日`
  }
  if (deadlineIso) return make(parseLocalDate(deadlineIso))
  // Fallback: use event date
  return make(parseLocalDate(invitation.eventDateIso || DEFAULT_EVENT_DATE))
})

const publicConfig = useRuntimeConfig().public

const form = reactive({
  name: '',
  email: '',
  attendance: '',
  dietaryRestrictions: '',
  alcohol: 'ok',
  phone: '',
  postalCode: '',
  address1: '',
  address2: '',
  message: ''
})

const rsvpStatus = ref<'idle' | 'ok' | 'error'>('idle')
const isSubmitting = ref(false)

function composeRsvpMessage() {
  const parts: string[] = []
  if (form.message?.trim()) parts.push(form.message.trim())
  if (form.dietaryRestrictions?.trim()) parts.push(`アレルギー等: ${form.dietaryRestrictions.trim()}`)
  if (form.alcohol === 'no') parts.push('お飲み物: アルコール不可')
  if (form.postalCode?.trim() || form.address1?.trim() || form.address2?.trim()) {
    const pc = form.postalCode?.trim() ? `〒${form.postalCode.trim()}` : ''
    const addr = [form.address1?.trim(), form.address2?.trim()].filter(Boolean).join(' ')
    parts.push(`ご住所: ${[pc, addr].filter(Boolean).join(' ')}`)
  }
  if (uploadedPhotoUrls.value.length) {
    parts.push('写真URL:')
    for (const u of uploadedPhotoUrls.value) parts.push(`- ${u}`)
  }
  if (form.phone?.trim()) parts.push(`電話番号: ${form.phone.trim()}`)
  return parts.join('\n')
}

async function submitRsvp() {
  if (isSubmitting.value) return
  try {
    isSubmitting.value = true
    // 先に写真アップロード（任意）
    if (photoFiles.value.length) {
      const urls = await uploadPhotos(photoFiles.value)
      uploadedPhotoUrls.value = urls
    } else {
      uploadedPhotoUrls.value = []
    }
    const payload = {
      name: form.name,
      email: form.email,
      attendance: form.attendance,
      message: composeRsvpMessage()
    }
    const { data, error } = await useFetch('/api/rsvp', {
      method: 'POST',
      body: payload
    })
    if (error.value) throw error.value
    if (data.value?.success) {
      rsvpStatus.value = 'ok'
      // 成功時の後処理: 下書きクリア → モーダル閉じる → サンクスページへ
      clearDraft()
      closeRsvp()
      await navigateTo('/thanks')
    } else {
      throw new Error('Request failed')
    }
  } catch (e) {
    rsvpStatus.value = 'error'
  } finally {
    isSubmitting.value = false
  }
}

// Countdown
const hasValidDate = computed(() => {
  const d = parseLocalDate(invitation.eventDateIso || DEFAULT_EVENT_DATE)
  return !!(d && !Number.isNaN(d.getTime()))
})

const toDateLabel = computed(() => {
  if (!hasValidDate.value) return ''
  const d = parseLocalDate((invitation.eventDateIso as string) || DEFAULT_EVENT_DATE) as Date
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
})

const timeLeft = reactive({ days: 0, hours: 0, minutes: 0, seconds: 0 })

function updateCountdown() {
  if (!hasValidDate.value) return
  const target = (parseLocalDate((invitation.eventDateIso as string) || DEFAULT_EVENT_DATE) as Date).getTime()
  const now = Date.now()
  let diff = Math.max(0, Math.floor((target - now) / 1000))
  const days = Math.floor(diff / 86400)
  diff -= days * 86400
  const hours = Math.floor(diff / 3600)
  diff -= hours * 3600
  const minutes = Math.floor(diff / 60)
  diff -= minutes * 60
  const seconds = diff
  timeLeft.days = days
  timeLeft.hours = hours
  timeLeft.minutes = minutes
  timeLeft.seconds = seconds
}

let timer: any
onMounted(() => {
  updateCountdown()
  timer = setInterval(updateCountdown, 1000)
})
onBeforeUnmount(() => clearInterval(timer))

// Dynamic head (title/OG) for premium share experience
useHead(() => {
  const title = `${displayCouple} | Wedding Invitation`
  const desc = displayDate.value && venue ? `Join us at ${venue} on ${displayDate.value}.` : 'Wedding invitation details.'
  return {
    title,
    meta: [
      { name: 'description', content: desc },
      { property: 'og:title', content: title },
      { property: 'og:description', content: desc }
    ]
  }
})

// Use app.config images; fallback excludes sample /hero.jpg,/couple.jpg
const heroImages = ((invitation as any).heroImages && (invitation as any).heroImages.length
  ? (invitation as any).heroImages
  : ['/ritz-lounge.JPG', '/ritz-flowers.png', '/ring-bouquet.JPG']) as any[]

// Per-image focal positions to preserve subject across aspect ratios
const heroSlides = computed(() => {
  const arr = heroImages as any[]
  const focalMap: Record<string, string> = {
    '/ritz-flowers_1.jpg': '50% 35%',
    '/ritz-flowers.png': '50% 35%',
    '/ring-bouquet_1.jpg': '50% 50%',
    '/ring-bouquet.JPG': '50% 50%',
    '/two.JPG': '50% 38%',
    '/ritz-lounge_1.jpg': '50% 50%',
    '/ritz-lounge.JPG': '50% 50%'
  }
  return arr.map((it) => {
    if (typeof it === 'string') {
      const pos = focalMap[it] || '50% 50%'
      return { src: it, position: pos }
    }
    const key = it.desktop || it.mobile || it.src
    const pos = focalMap[key] || '50% 50%'
    // Normalize to { src, position } so HeroSlider can render
    return { src: key, position: pos }
  })
})

// 出欠が変更されたら、欠席確認チェックはリセット
watch(() => form.attendance, (v) => {
  if (v !== 'declining') declineConfirm.value = false
  // 出欠トグルによる直後の自動保存ではトーストを抑制
  suppressAutosaveToast.value = true
})

// RSVP modal control
const rsvpOpen = ref(false)
function openRsvp() {
  rsvpOpen.value = true
}
function closeRsvp() {
  rsvpOpen.value = false
}

// Disable background scroll while RSVP modal is open
if (typeof window !== 'undefined') {
  watch(rsvpOpen, (v) => {
    const doc = document.documentElement
    const body = document.body
    if (v) {
      const scrollBarWidth = window.innerWidth - doc.clientWidth
      body.style.overflow = 'hidden'
      if (scrollBarWidth > 0) body.style.paddingRight = scrollBarWidth + 'px'
    } else {
      body.style.overflow = ''
      body.style.paddingRight = ''
    }
  })
}

// Auto-adjust Message letter box height to viewport minus header
const letterBoxStyle = ref<Record<string, string>>({})
const messageContentWrap = ref<HTMLElement | null>(null)
const messageScale = ref(1)
const messageFontPx = ref(15)
const messageGapPx = ref(20)
const messageContentStyle = computed(() => {
  return {
    fontSize: messageFontPx.value + 'px',
    ['--msg-gap' as any]: messageGapPx.value + 'px'
  } as Record<string, string>
})
function updateLetterBoxMinHeight() {
  if (typeof window === 'undefined') return
  const header = document.querySelector('header.sticky') as HTMLElement | null
  const headerH = header?.offsetHeight ?? 64
  const vpH = (window as any).visualViewport?.height ?? window.innerHeight
  const target = Math.max(560, vpH - headerH - 8)
  letterBoxStyle.value = { minHeight: `${target}px` }
}
function updateMessageFit() {
  if (typeof window === 'undefined') return
  const wrap = messageContentWrap.value
  if (!wrap) return
  // Sticky header height (outside the letter box)
  const stickyHeader = document.querySelector('header.sticky') as HTMLElement | null
  const stickyH = stickyHeader?.offsetHeight ?? 64
  const vpH = (window as any).visualViewport?.height ?? window.innerHeight
  const minPanel = Math.max(560, vpH - stickyH - 8)
  // Card header inside the white panel (MESSAGE ご挨拶など)
  const cardHeader = (wrap.previousElementSibling as HTMLElement) || (wrap.parentElement?.querySelector('header') as HTMLElement | null)
  const headH = cardHeader?.offsetHeight ?? 0
  const available = Math.max(0, minPanel - headH - 16)

  // Reset to base for current viewport
  const isDesktop = window.matchMedia('(min-width: 768px)').matches
  const baseFs = isDesktop ? 16 : 15
  // Base vertical gap between MESSAGE lines（やや詰め気味に調整）
  const baseGap = isDesktop ? 18 : 14
  messageScale.value = 1
  messageFontPx.value = baseFs
  messageGapPx.value = baseGap

  // Measure current content
  const contentH = wrap.scrollHeight
  if (!available || !contentH) return
  if (contentH <= available) return

  const ratio = available / contentH
  // Try font-size and gap first (down to 12px on mobile)
  const targetFs = Math.max(12, Math.floor(baseFs * Math.min(1, ratio)))
  const fsScale = targetFs / baseFs
  messageFontPx.value = targetFs
  messageGapPx.value = Math.max(8, Math.round(baseGap * fsScale))

  // Re-measure after style changes; then fallback to scale ifまだはみ出す
  requestAnimationFrame(() => {
    const afterH = wrap.scrollHeight
    if (afterH > available) {
      const s = Math.min(1, available / afterH)
      messageScale.value = isDesktop ? 1 : s
    }
  })
}
onMounted(() => {
  updateLetterBoxMinHeight()
  // Run after layout settles
  setTimeout(updateMessageFit, 0)
  // Avoid jank on mobile when URL bar shows/hides: only recompute on width changes or orientation change
  let lastW = window.innerWidth
  const onResizeStable = () => {
    const w = window.innerWidth
    if (Math.abs(w - lastW) < 2) return
    lastW = w
    updateLetterBoxMinHeight()
    updateMessageFit()
  }
  window.addEventListener('resize', onResizeStable, { passive: true })
  window.addEventListener('orientationchange', () => setTimeout(() => { updateLetterBoxMinHeight(); updateMessageFit() }, 60), { passive: true })
  ;(window as any).__onResizeStable = onResizeStable
})
onBeforeUnmount(() => {
  const onResizeStable = (window as any).__onResizeStable
  if (onResizeStable) window.removeEventListener('resize', onResizeStable)
})

// Recompute scale when message content changes
watch(messageDisplay, () => {
  nextTick(() => updateMessageFit())
})

// Keep at least N chars on the last line to avoid awkward short lines (JP widows)
function widowSafe(text: string, min: number = 5) {
  try {
    const chars = Array.from((text || '').toString())
    if (chars.length <= min) return text
    const head = chars.slice(0, -min).join('')
    const tail = chars.slice(-min).join('')
    return `${head}<span class="nowrap-chunk">${tail}</span>`
  } catch {
    return text
  }
}

// Soft break helpers for place/address to insert <wbr> at natural points
const placeDisplayBr = computed(() => softBreakPlace(placeDisplay))
const venueAddressBr = computed(() => softBreakAddress(venueAddress))

function softBreakPlace(s?: string) {
  const t = (s || '').toString()
  // Break opportunities after middle dot or spaces
  return t.replace(/・/g, '・<wbr>').replace(/\s+/g, ' <wbr>')
}
function softBreakAddress(s?: string) {
  let t = (s || '').toString()
  // After postal code block
  // Force a line break between postal code and the rest
  t = t.replace(/(〒\d{3}-\d{4})\s*/, '$1<br>')
  // After '丁目'
  t = t.replace(/丁目/g, '丁目<wbr>')
  // Allow breaks after hyphen between numbers (e.g., 5-25)
  t = t.replace(/-(?=\d)/g, '<wbr>-')
  // After commas-like punctuation
  t = t.replace(/、/g, '、<wbr>')
  // Normalize excessive spaces
  t = t.replace(/\s{2,}/g, ' ')
  return t
}

// Optional photo upload (任意)
const photoFiles = ref<File[]>([])
const uploadedPhotoUrls = ref<string[]>([])
function onPhotoSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files || [])
  const next = [...photoFiles.value]
  for (const f of files) {
    if (!f.type.startsWith('image/')) continue
    if (f.size > 10 * 1024 * 1024) continue // 10MB制限
    if (next.length >= 10) break
    next.push(f)
  }
  photoFiles.value = next
  input.value = ''
}
function removePhotoAt(i: number) {
  const next = [...photoFiles.value]
  next.splice(i, 1)
  photoFiles.value = next
}
async function uploadPhotos(files: File[]) {
  const formData = new FormData()
  files.forEach((f) => formData.append('files', f))
  const { data, error } = await useFetch('/api/upload', { method: 'POST', body: formData })
  if (error.value) throw error.value
  const urls = (data.value as any)?.urls as string[] | undefined
  return urls || []
}

// Manage preview object URLs on client
const photoPreviews = ref<string[]>([])
function revokePreviews() {
  if (typeof window === 'undefined') return
  for (const u of photoPreviews.value) {
    try { URL.revokeObjectURL(u) } catch {}
  }
  photoPreviews.value = []
}
watch(photoFiles, (files) => {
  revokePreviews()
  if (typeof window === 'undefined' || typeof URL === 'undefined') return
  photoPreviews.value = files.map((f) => URL.createObjectURL(f))
})
onBeforeUnmount(() => revokePreviews())

// Draft autosave/load
const DRAFT_KEY = 'rsvp_draft_v1'
type DraftState = Partial<typeof form> & { attendance?: string }
const draftStatus = ref<'idle' | 'restored' | 'saved' | 'cleared'>('idle')
// 初回の自動保存（復元直後など）はトーストを出さないためのフラグ
const suppressAutosaveToast = ref(true)

function loadDraft() {
  try {
    if (typeof window === 'undefined') return
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return
    const data = JSON.parse(raw) as DraftState
    Object.assign(form, data)
    draftStatus.value = 'restored'
    setTimeout(() => { if (draftStatus.value === 'restored') draftStatus.value = 'idle' }, 2000)
    // 復元直後の自動保存は無言で行う
    suppressAutosaveToast.value = true
  } catch {}
}
function saveDraft(showToast = true) {
  try {
    if (typeof window === 'undefined') return
    const copy: DraftState = { ...form }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(copy))
    if (showToast) {
      draftStatus.value = 'saved'
      setTimeout(() => { if (draftStatus.value === 'saved') draftStatus.value = 'idle' }, 1600)
    }
  } catch {}
}
function manualSaveDraft() { saveDraft(true) }
function clearDraft() {
  try {
    if (typeof window === 'undefined') return
    localStorage.removeItem(DRAFT_KEY)
    draftStatus.value = 'cleared'
    setTimeout(() => { if (draftStatus.value === 'cleared') draftStatus.value = 'idle' }, 1600)
  } catch {}
}

let draftTimer: any
watch(form, () => {
  if (typeof window === 'undefined') return
  clearTimeout(draftTimer)
  draftTimer = setTimeout(() => {
    // suppressAutosaveToast が true の時は一度だけトースト非表示で保存
    saveDraft(!suppressAutosaveToast.value)
    suppressAutosaveToast.value = false
  }, 500)
}, { deep: true })

onMounted(() => {
  loadDraft()
})
</script>
