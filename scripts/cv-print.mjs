// Prints a CV page to PDF with headless Chromium. Shared by scripts/cv-pdf.mjs (the PDFs of the
// generated site) and scripts/cv-dev.mjs (the PDF made on request in npm run dev), so the two
// can't drift apart.

import {chromium} from 'playwright'

/** The CV page of each language. */
export const CV_PAGES = {it: '/cv', en: '/en/cv', ro: '/ro/cv'}
/** The PDF of a language, as the "Download CV" button links to it: keep in step with useCvLink(). */
export const CV_FILE = locale => `cv/leica-florian-robert-cv-${locale}.pdf`
/** The locale of a PDF path (`/cv/leica-florian-robert-cv-en.pdf` → `en`), or null. */
export const localeOfCvFile = path => path.match(/^\/cv\/leica-florian-robert-cv-([a-z]{2})\.pdf$/)?.[1] ?? null

const MAX_PAGES = 1

/** Why a CV can't be printed: the message says what to fix. */
export class CvError extends Error {}

/** Headless Chromium, with the install command in the error when it's missing. */
export async function launchBrowser() {
  try {
    return await chromium.launch()
  } catch (error) {
    throw new CvError(`Chromium doesn't start: run \`npx playwright install chromium\` (on a bare Linux build, with --with-deps).\n${error.message}`)
  }
}

/**
 * The PDF of the CV page at `url`, checked: no name, no experiences, a dark sheet, a grey
 * column that overflows or a second page throw a CvError rather than print a wrong CV.
 */
export async function printCv(browser, url) {
  const page = await browser.newPage()
  try {
    // the sheet lays out differently on screen (one long page): check it as it prints
    await page.emulateMedia({media: 'print'})
    const response = await page.goto(url, {waitUntil: 'networkidle'})
    if (!response?.ok()) throw new CvError(`${url} answers ${response?.status()}; is it in nitro.prerender.routes?`)

    // the sheet drops the experiences that don't fit, then marks itself ready
    if (!await page.waitForSelector('[data-cv-ready]', {timeout: 10_000}).then(() => true, () => false)) {
      throw new CvError('the CV never got ready (data-cv-ready)')
    }

    const sheet = await page.evaluate(() => {
      const side = document.querySelector('[data-cv-side]')
      return {
        name: document.querySelector('h1')?.textContent?.trim(),
        experiences: document.querySelectorAll('[data-cv-experience]').length,
        background: getComputedStyle(document.documentElement).backgroundColor,
        overflow: side ? side.scrollHeight - side.clientHeight : 0,
      }
    })
    if (!sheet.name) throw new CvError('the CV has no name (h1)')
    if (!sheet.experiences) throw new CvError('the CV has no experiences')
    if (sheet.background !== 'rgb(255, 255, 255)') throw new CvError(`the CV is not on white paper (html background ${sheet.background})`)
    if (sheet.overflow > 0) throw new CvError(`the grey column overflows the page by ${sheet.overflow}px (its end would be cut off)`)

    const pdf = await page.pdf({preferCSSPageSize: true, printBackground: true})
    const pages = pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g)?.length ?? 0
    if (pages > MAX_PAGES) throw new CvError(`the CV runs to ${pages} pages, not ${MAX_PAGES}`)
    return {pdf, pages}
  } finally {
    await page.close()
  }
}
