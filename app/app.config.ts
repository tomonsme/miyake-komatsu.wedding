export default defineAppConfig({
  invitation: {
    couple: 'Tomoya & Mihono',
    groomName: '三宅 智也',
    brideName: '小松 美穂乃',
    eventDateIso: '2026-02-07',
    // RSVP deadline (ISO, shown as "YYYY年M月D日までに回答")
    rsvpDeadlineIso: '2026-01-07',
    venueName: 'ザ・リッツ・カールトン大阪',
    venueAddress: '〒530-0001 大阪府大阪市北区梅田2丁目5-25',
    // Show map label as リッツ・カールトン大阪 while keeping address text
    googleMapUrl: 'https://www.google.com/maps?q=%E3%82%B6%E3%83%BB%E3%83%AA%E3%83%83%E3%83%84%E3%83%BB%E3%82%AB%E3%83%BC%E3%83%AB%E3%83%88%E3%83%B3%E5%A4%A7%E9%98%AA&hl=ja&z=16&output=embed',
    venuePhone: '—',
    venueUrl: '',
    // 画像のプレースホルダ（後で差し替え可能）
    headerCrestUrl: '/favicon.png',
    // Use individual photos
    groomPhotoUrl: '/groom.JPG',
    bridePhotoUrl: '/bride.JPG',
    ceremonyTime: '',
    receptionOpenTime: '13:30',
    receptionTime: '14:00',
    receptionStaffCallTime: '13:00',
    message: `謹啓

平素は格別のご厚情を賜り 厚く御礼申し上げます
このたび私たちは日頃よりお世話になっております皆様への感謝の気持ちを込め
ささやかではございますが<span class="nowrap-chunk">披露宴</span>を執り行うこととなりました
ご多用のところ誠に恐縮ではございますが ご臨席を賜りたく謹んでご案内申し上げます

謹白

三宅 智也
小松 美穂乃`,
    familyMessage: `謹啓

平素より格別のご厚情を賜り 厚く御礼申し上げます

おかげさまで このたび私たちは
親族の皆さまの日頃の温かいお支えを賜り
挙式ならびに披露宴を執り行う運びとなりました

つきましては 日頃よりお世話になっております親族の皆さまに
ぜひご臨席を賜りたく 謹んでご案内申し上げます

ご多用の折とは存じますが
何卒ご出席賜りますよう 心よりお願い申し上げます

謹白

三宅 智也
小松 美穂乃`,
    receptionStaffMessage: `謹啓

平素より格別のご厚情を賜り 誠にありがとうございます
私たちはこのたび 日頃の感謝をお伝えしたく 披露宴を執り行う運びとなりました

あわせて 受付をご快諾くださり 心より御礼申し上げます
誠に恐れ入りますが 当日は13時までに会場へお越しくださいますようお願い申し上げます

ご多用のところ恐縮ではございますが
当日はご臨席を賜りますよう 謹んでお願い申し上げます

謹白

三宅 智也
小松 美穂乃`,
    toastSpeakerMessage: `あわせて 乾杯のご発声を快くお引き受けくださり 心より御礼申し上げます
披露宴の開宴に合わせてご挨拶を賜りたく存じますので 当日もどうぞよろしくお願いいたします`,
    // Hero slider images (public/ 配下のパス)
    heroImages: [
      // hero2 配下のPNGをヒーローに使用（順番は任意に変更可）
      '/hero2/IMG_7286.png',
      '/hero2/IMG_7290.png',
      '/hero2/IMG_7282.png'
    ],
    countdownBgUrl: '/countdown1.jpg',
    // Optional overlay image for hero (now optimized WebP)
    welcomeOverlayUrl: '/welcome-overlay.webp',
    // Footer label (e.g., brand or couple name)
    copyrightLabel: 'weddinginvitation-miyake-komatsu'
  }
})
