// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  srcDir: 'app',
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  // Ensure file-based routing is enabled
  pages: true,
  modules: ['@nuxtjs/tailwindcss', '@nuxt/image', '@nuxtjs/seo', '@vueuse/motion/nuxt'],
  // components path stays relative to project root
  components: [{ path: './components', pathPrefix: false }],
  css: ['~/assets/css/tailwind.css'],
  app: {
    head: {
      title: 'Wedding Invitation',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'A heartfelt wedding invitation experience for {{COUPLE}}.' },
        { property: 'og:title', content: 'Wedding Invitation for {{COUPLE}}' },
        {
          property: 'og:description',
          content: 'Join us to celebrate love at {{VENUE_NAME}} on {{DATE_ISO}}.'
        },
        { property: 'og:type', content: 'website' },
        { property: 'og:image', content: '/og.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'theme-color', content: '#BDA06A' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        // Preload stylesheet to speed up first render
        {
          rel: 'preload', as: 'style',
          href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Cormorant+Garamond:wght@400;600;700&family=Noto+Serif+JP:wght@400;600;700&display=swap',
          onload: "this.onload=null;this.rel='stylesheet'"
        },
        {
          rel: 'stylesheet',
          // Display: Playfair/Cormorant (Latin). Body/JP: Noto Serif JP
          href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Cormorant+Garamond:wght@400;600;700&family=Noto+Serif+JP:wght@400;600;700&display=swap'
        }
      ]
    }
  },
  runtimeConfig: {
    rsvpMode: process.env.RSVP_MODE || 'google',
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
    googleFormEmbedUrl: process.env.GOOGLE_FORM_EMBED_URL || '',
    ownAssets: process.env.OWN_ASSETS === 'true',
    // Private email config (server only)
    sesRegion: process.env.SES_REGION || '',
    sesFrom: process.env.SES_FROM || '',
    sesTo: process.env.SES_TO || '',
    sesReplyTo: process.env.SES_REPLY_TO || '',
    public: {
      rsvpMode: process.env.RSVP_MODE || 'google',
      googleFormEmbedUrl: process.env.GOOGLE_FORM_EMBED_URL || '',
      ownAssets: process.env.OWN_ASSETS === 'true'
    }
  },
  routeRules: process.env.NODE_ENV === 'production'
    ? { '/**': { swr: true } }
    : {},
  image: {
    domains: [],
    presets: {
      hero: {
        // Revert to JPG to ensure compatibility with local static images
        modifiers: { fit: 'cover', format: 'jpg', quality: 80 }
      },
      gallery: {
        modifiers: { fit: 'cover', format: 'webp', quality: 70 }
      }
    }
  },
  nitro: {
    prerender: {
      routes: ['/thanks']
    }
  }
})
