declare global {
  interface Window {
    getCkyConsent?: () => unknown
    revisitCkyConsent?: () => void
  }
}

/** Whether CookieYes has loaded, set only by the `consent.client` plugin. */
export function useConsentState() {
  return useState('cookie-consent', () => ({ready: false}))
}

/**
 * The «Cookie preferences» link of the footers. CookieYes stores the visitor's choice and lets
 * them change it; the site only opens its preferences (`manage`), once it has loaded (`ready`).
 * Without a CookieYes id (`enabled` false) there is nothing to open. reCAPTCHA doesn't depend
 * on it: it is treated as necessary (`useContactForm`).
 */
export function useCookieConsent() {
  const enabled = !!useRuntimeConfig().public.cookieyesId
  const state = useConsentState()

  return {
    enabled,
    ready: computed(() => enabled && state.value.ready),
    manage: () => window.revisitCkyConsent?.(),
  }
}
