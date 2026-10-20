// https://nuxt.com/docs/api/configuration/nuxt-config

import tailwindcss from '@tailwindcss/vite'
import cvDevHandler from './scripts/cv-dev.mjs'

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
        // PNG, not the SVG logo: a favicon can't load JetBrains Mono, so the SVG text falls back to another font
        {rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png'},
        {rel: 'icon', type: 'image/png', sizes: '64x64', href: '/favicon-64.png'},
        {rel: 'icon', type: 'image/x-icon', href: '/favicon.ico'},
      ],
      meta: [
        {name: 'theme-color', content: '#111113'},
      ],
      script: [
        {
          // Before first paint: if the page opens in native mode (`?engine=`, or else the saved
          // choice), the generated legacy page stays hidden until the engine.client plugin replaces it.
          innerHTML: `try{var e=new URLSearchParams(location.search).get('engine');if(e!=='legacy'&&e!=='native')e=localStorage.getItem('lfr-engine');if(e==='native')document.documentElement.classList.add('engine-native-pending')}catch(e){}`,
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
      cookieyesId: '',
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
      // the CV pages: nothing links to them, scripts/cv-pdf.mjs prints them to PDF
      routes: ['/', '/en', '/ro', '/cv', '/en/cv', '/ro/cv'],
    },
  },
  // in dev the CV PDFs aren't generated: print them on request (scripts/cv-dev.mjs)
  devServerHandlers: [{route: '/cv', handler: cvDevHandler}],
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
