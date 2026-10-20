/**
 * Mirrors CookieYes's consent into `useConsentState()`: once at start and whenever the banner
 * loads or the visitor changes their choice. After hydration, like `engine.client`, so the
 * form renders as on the server (not granted) first.
 */
export default defineNuxtPlugin((nuxtApp) => {
  if (!useRuntimeConfig().public.cookieyesId) return
  const state = useConsentState()

  function read() {
    const consent = window.getCkyConsent?.()
    if (!consent) return
    state.value = {ready: true, granted: consent.categories[RECAPTCHA_CONSENT_CATEGORY] === true}
  }

  // the hook fires again on every page change: listen once
  const unhook = nuxtApp.hook('app:suspense:resolve', () => {
    unhook()
    document.addEventListener('cookieyes_banner_load', read)
    document.addEventListener('cookieyes_consent_update', read)
    read()
  })
})
