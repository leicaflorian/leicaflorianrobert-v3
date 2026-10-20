/** What CookieYes's `getCkyConsent()` returns, the part the site reads. */
interface CkyConsent {
  categories: Record<string, boolean>
  isUserActionCompleted: boolean
}

declare global {
  interface Window {
    getCkyConsent?: () => CkyConsent
    revisitCkyConsent?: () => void
  }
}

/** The consent state, written only by the `consent.client` plugin from CookieYes. */
export function useConsentState() {
  return useState('recaptcha-consent', () => ({ready: false, granted: false}))
}

/**
 * Whether the visitor accepted reCAPTCHA. CookieYes is the source: it stores the choice and
 * lets the visitor change it, the site only reads it. Without a CookieYes id (`enabled`
 * false) there is nothing to ask, and the form works as granted. `ready` turns true once
 * CookieYes answers, so its preferences can be opened (`manage`).
 */
export function useRecaptchaConsent() {
  const enabled = !!useRuntimeConfig().public.cookieyesId
  const state = useConsentState()

  return {
    enabled,
    ready: computed(() => enabled && state.value.ready),
    granted: computed(() => !enabled || state.value.granted),
    manage: () => window.revisitCkyConsent?.(),
  }
}
