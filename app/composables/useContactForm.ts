import type {BriefBudget, BriefTimeline, BriefType} from '~/utils/brief'

export interface ContactMessage {
  name: string
  email: string
  message: string
  project_types: BriefType[]
  budget: BriefBudget | null
  timeline: BriefTimeline | null
}

type Status = 'idle' | 'sending' | 'sent' | 'error'

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void
      execute: (siteKey: string, options: {action: string}) => Promise<string>
    }
  }
}

const empty = (): ContactMessage => ({
  name: '', email: '', message: '', project_types: [], budget: null, timeline: null,
})

/**
 * What the visitor is writing in the contact form. Shared state: the native `project.json`
 * panel shows it as it's typed, and switching engine keeps it.
 */
export function useContactDraft() {
  return useState<ContactMessage>('contact-draft', empty)
}

/**
 * Sends the contact form to the Directus `/contact` endpoint (the `contact-endpoint`
 * extension), with the reCAPTCHA v3 token if the key is configured. reCAPTCHA is treated
 * as necessary: Google's script loads with the form, whatever the visitor chose in CookieYes.
 */
export function useContactForm() {
  const {public: {directusUrl, recaptchaSiteKey}} = useRuntimeConfig()
  const {locale} = useI18n()
  const draft = useContactDraft()
  const status = ref<Status>('idle')

  if (recaptchaSiteKey) {
    useHead({
      script: [{key: 'recaptcha', src: `https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`, async: true, defer: true}],
    })
  }

  async function recaptchaToken(): Promise<string | undefined> {
    const grecaptcha = window.grecaptcha
    if (!recaptchaSiteKey || !grecaptcha) return undefined
    await new Promise<void>(resolve => grecaptcha.ready(resolve))
    return grecaptcha.execute(recaptchaSiteKey, {action: 'contact'})
  }

  /** Sends the draft; clears it if sending succeeds. */
  async function submit() {
    status.value = 'sending'
    try {
      await $fetch(`${directusUrl}/contact`, {
        method: 'POST',
        body: {...draft.value, locale: locale.value, token: await recaptchaToken()},
      })
      status.value = 'sent'
      draft.value = empty()
    } catch {
      status.value = 'error'
    }
  }

  /** Clears the form (the legacy "Reset" button). */
  function reset() {
    draft.value = empty()
    status.value = 'idle'
  }

  return {draft, status, submit, reset}
}
