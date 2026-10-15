// https://nuxt.com/docs/api/configuration/nuxt-config

import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: {enabled: true},
  modules: [
    '@nuxtjs/i18n',
    '@nuxt/fonts',
    '@nuxt/image',
  ],
  css: ['~/assets/css/main.css'],
  app: {
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
  runtimeConfig: {
    public: {
      siteUrl: 'https://leicaflorianrobert.dev',
      directusUrl: 'http://localhost:8055',
      recaptchaSiteKey: '',
    },
  },
  fonts: {
    families: [
      {name: 'JetBrains Mono', provider: 'google', weights: [400, 500, 700, 800]},
    ],
  },
  image: {
    provider: 'directus',
    directus: {
      baseURL: `${process.env.NUXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055'}/assets/`,
    },
    format: ['webp'],
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
    customRoutes: 'config',
    pages: {
      'about': {it: '/chi-sono', en: '/about', ro: '/despre-mine'},
      'projects': {it: '/progetti', en: '/projects', ro: '/proiecte'},
      'projects-v3': {it: '/progetti/v3', en: '/projects/v3', ro: '/proiecte/v3'},
      'contact': {it: '/contatti', en: '/contact', ro: '/contact'},
    },
  },
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
})
