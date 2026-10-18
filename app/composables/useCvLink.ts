/**
 * The CV PDF in the current language. scripts/cv-pdf.mjs prints it after `nuxt generate`,
 * with the same file name: in `npm run dev` it doesn't exist, so the link is a 404.
 */
export function useCvLink() {
  const {locale} = useI18n()
  return computed(() => `/cv/leica-florian-robert-cv-${locale.value}.pdf`)
}
