export interface ContactMessage {
  name: string
  surname?: string
  email: string
  message: string
}

type Status = 'idle' | 'sending' | 'sent' | 'error'

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}

/**
 * Sends the contact form to the Directus `/contact` endpoint (the `contact-endpoint`
 * extension), with the reCAPTCHA v3 token if the key is configured.
 */
export function useContactForm() {
  const {public: {directusUrl, recaptchaSiteKey}} = useRuntimeConfig()
  const {locale} = useI18n()
  const status = ref<Status>('idle')

  if (recaptchaSiteKey) {
    useHead({script: [{src: `https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`, async: true, defer: true}]})
  }

  async function recaptchaToken(): Promise<string | undefined> {
    const grecaptcha = window.grecaptcha
    if (!recaptchaSiteKey || !grecaptcha) return undefined
    await new Promise<void>(resolve => grecaptcha.ready(resolve))
    return grecaptcha.execute(recaptchaSiteKey, {action: 'contact'})
  }

  async function send(message: ContactMessage) {
    status.value = 'sending'
    try {
      await $fetch(`${directusUrl}/contact`, {
        method: 'POST',
        body: {...message, locale: locale.value, token: await recaptchaToken()},
      })
      status.value = 'sent'
    } catch {
      status.value = 'error'
    }
  }

  /** Reads the fields of a <form> and sends it; clears the form if sending succeeds. */
  async function submit(event: Event) {
    const form = event.target as HTMLFormElement
    const data = Object.fromEntries(new FormData(form)) as unknown as ContactMessage
    await send(data)
    if (status.value === 'sent') form.reset()
  }

  return {status, send, submit}
}
