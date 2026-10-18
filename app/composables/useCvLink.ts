/**
 * The CV PDF in the current language. scripts/cv-pdf.mjs prints it after `nuxt generate`,
 * with the same file name; in `npm run dev` scripts/cv-dev.mjs prints it on request.
 */
export function useCvLink() {
  const {locale} = useI18n()
  return computed(() => `/cv/leica-florian-robert-cv-${locale.value}.pdf`)
}
