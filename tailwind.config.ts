import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{vue,js,ts}',
    './app.vue',
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
    './plugins/**/*.{js,ts}',
    './composables/**/*.{js,ts}',
    './utils/**/*.{js,ts}'
  ],
  theme: {
    extend: {
      colors: {
        // Colors mapped to CSS variables for opacity support
        primary: 'rgb(var(--gold) / <alpha-value>)', // keep existing usage; aligns to gold
        gold: 'rgb(var(--gold) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        royal: 'rgb(var(--royal) / <alpha-value>)',
        ivory: 'rgb(var(--ivory) / <alpha-value>)',
        champagne: 'rgb(var(--champagne) / <alpha-value>)',
        soft: 'rgb(var(--ivory) / <alpha-value>)'
      },
      fontFamily: {
        // Body: unify Japanese to Noto Serif JP
        sans: ['"Noto Sans JP"', 'system-ui', 'Arial', 'sans-serif'],
        display: ['"Playfair Display"', '"Cormorant Garamond"', '"Noto Serif JP"', 'serif'],
        // Use Noto Serif JP as primary for generic serif (so font-serif => JP serif)
        serif: ['"Noto Serif JP"', 'serif']
      },
      boxShadow: {
        card: '0 20px 45px -25px rgba(17, 24, 39, 0.35)',
        glow: '0 10px 25px -10px rgba(189, 160, 106, 0.45)'
      },
      transitionTimingFunction: {
        soft: 'cubic-bezier(0.4, 0, 0.2, 1)'
      },
      backgroundImage: {
        // Darker overlay for hero images to improve legibility
        'hero-overlay': 'linear-gradient(180deg, rgba(0,0,0,.4) 0%, rgba(0,0,0,.6) 100%)'
      }
    }
  }
} satisfies Config
