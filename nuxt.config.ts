// https://nuxt.com/docs/api/configuration/nuxt-config

import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxtjs/i18n',
    '@nuxt/fonts',
    '@nuxt/image',
  ],
  devtools: {enabled: true},
  app: {
    // the page fades out, then the next one in; only native mode styles it (main.css)
    pageTransition: {name: 'page', mode: 'out-in'},
    head: {
      htmlAttrs: {lang: 'it'},
      link: [
        {rel: 'icon', type: 'image/svg+xml', href: '/imgs/logo-lfr-app.svg'},
        {rel: 'icon', type: 'image/x-icon', href: '/favicon.ico'},
      ],
      meta: [
        {name: 'theme-color', content: '#111113'},
      ],
      script: [
        {
          // Before first paint: if the visitor had chosen native mode,
          // the generated legacy page stays hidden until the engine.client plugin replaces it.
          innerHTML: `try{if(localStorage.getItem('lfr-engine')==='native')document.documentElement.classList.add('engine-native-pending')}catch(e){}`,
          tagPosition: 'head',
        },
      ],
    },
  },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      siteUrl: 'https://leicaflorianrobert.dev',
      directusUrl: 'http://localhost:8055',
      recaptchaSiteKey: '',
    },
  },
  experimental: {
    // Switching engine unmounts every block: keep their content (small, static) instead of
    // fetching it again from Directus in the browser.
    purgeCachedData: false,
  },
  compatibilityDate: '2025-07-15',
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/en', '/ro'],
    },
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  eslint: {
    config: {
      // formatting rules, matched to the existing code style
      stylistic: {
        indent: 2,
        quotes: 'single',
        semi: false,
        braceStyle: '1tbs',
      },
    },
  },
  fonts: {
    families: [
      {name: 'JetBrains Mono', provider: 'google', weights: [400, 500, 700, 800]},
    ],
  },
  i18n: {
    baseUrl: 'https://leicaflorianrobert.dev',
    defaultLocale: 'it',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: false,
    locales: [
      {code: 'it', language: 'it-IT', name: 'italiano', file: 'it.json'},
      {code: 'en', language: 'en-US', name: 'english', file: 'en.json'},
      {code: 'ro', language: 'ro-RO', name: 'română', file: 'ro.json'},
    ],
  },
  image: {
    provider: 'directus',
    directus: {
      baseURL: `${process.env.NUXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055'}/assets/`,
    },
    format: ['webp'],
  },
})
