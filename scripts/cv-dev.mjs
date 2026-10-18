// In npm run dev the CV PDFs don't exist yet (scripts/cv-pdf.mjs makes them after generate):
// this handler prints one on request, from the dev server's own /cv page, so the "Download CV"
// button works as on the live site. Registered in nuxt.config.ts as a dev-only handler.

import {defineEventHandler, getRequestURL, setResponseHeader, setResponseStatus} from 'h3'
import {CV_PAGES, CvError, launchBrowser, localeOfCvFile, printCv} from './cv-print.mjs'

/** One Chromium for the whole dev session: launched on the first download. */
let browser

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const locale = localeOfCvFile(url.pathname)
  // anything else under /cv (the CV page itself) goes on to Nuxt
  if (!locale || !CV_PAGES[locale]) return

  try {
    browser ??= await launchBrowser()
    const {pdf} = await printCv(browser, url.origin + CV_PAGES[locale])
    setResponseHeader(event, 'content-type', 'application/pdf')
    return pdf
  } catch (error) {
    if (!(error instanceof CvError)) throw error
    console.error(`[cv] ${locale}: ${error.message}`)
    setResponseStatus(event, 500)
    setResponseHeader(event, 'content-type', 'text/plain; charset=utf-8')
    return `The CV can't be printed: ${error.message}`
  }
})
