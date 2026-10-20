/**
 * Mirrors CookieYes's consent into `useConsentState()`: once at start and whenever the banner
 * loads or the visitor changes their choice. After hydration, like `engine.client`, so the
 * form renders as on the server (not granted) first.
 */
export default defineNuxtPlugin((nuxtApp) => {
  if (!useRuntimeConfig().public.cookieyesId) return
  const state = useConsentState()

  /** An update event carries the accepted categories itself: trusted over a store read. */
  function read(event?: Event) {
    const accepted = (event as CustomEvent<{accepted?: string[]} | undefined> | undefined)?.detail?.accepted
    const consent = window.getCkyConsent?.()
    if (!accepted && !consent) return
    const granted = accepted ? accepted.includes(RECAPTCHA_CONSENT_CATEGORY) : consent!.categories[RECAPTCHA_CONSENT_CATEGORY] === true
    state.value = {ready: true, granted}
  }

  // the hook fires again on every page change: listen once
  const unhook = nuxtApp.hook('app:suspense:resolve', () => {
    unhook()
    document.addEventListener('cookieyes_banner_load', read)
    document.addEventListener('cookieyes_consent_update', read)
    read()
  })
})
