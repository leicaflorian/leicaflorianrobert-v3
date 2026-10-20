/**
 * Marks CookieYes as ready in `useConsentState()`, so the footers can show «Cookie preferences»:
 * at start if it has already loaded, or when its banner loads. After hydration, like
 * `engine.client`, so the footers render as on the server first.
 */
export default defineNuxtPlugin((nuxtApp) => {
  if (!useRuntimeConfig().public.cookieyesId) return
  const state = useConsentState()
  const ready = () => state.value = {ready: true}

  // the hook fires again on every page change: listen once
  const unhook = nuxtApp.hook('app:suspense:resolve', () => {
    unhook()
    document.addEventListener('cookieyes_banner_load', ready)
    if (window.getCkyConsent) ready()
  })
})
