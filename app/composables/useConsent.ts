/** What CookieYes's `getCkyConsent()` returns, the part the site reads. */
interface CkyConsent {
  categories: Record<string, boolean>
  isUserActionCompleted: boolean
}

declare global {
  interface Window {
    getCkyConsent?: () => CkyConsent
    revisitCkyConsent?: () => void
    performBannerAction?: (action: 'accept_all' | 'accept_partial' | 'reject') => void
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
 * CookieYes answers, so its preferences can be opened (`manage`) or reCAPTCHA accepted alone
 * (`accept`): it ticks only that category's switches and saves them as a partial choice, the
 * other categories keep what they had. Without the switches it opens the preferences.
 */
export function useRecaptchaConsent() {
  const enabled = !!useRuntimeConfig().public.cookieyesId
  const state = useConsentState()

  return {
    enabled,
    ready: computed(() => enabled && state.value.ready),
    granted: computed(() => !enabled || state.value.granted),
    manage: () => window.revisitCkyConsent?.(),
    accept() {
      const switches = ['ckySwitch', 'ckyCategoryDirect']
        .map(prefix => document.getElementById(prefix + RECAPTCHA_CONSENT_CATEGORY))
        .filter((input): input is HTMLInputElement => input instanceof HTMLInputElement)
      if (!switches.length || !window.performBannerAction) return window.revisitCkyConsent?.()
      switches.forEach(input => input.checked = true)
      window.performBannerAction('accept_partial')
    },
  }
}
