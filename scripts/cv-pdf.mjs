// Prints the CV pages of the generated site to PDF, one per language, next to the site.
// Runs after `nuxt generate` (npm run generate); `npm run cv:pdf` redoes only the PDFs.
//
//   node scripts/cv-pdf.mjs
//
// Needs Chromium: npx playwright install chromium

import {createServer} from 'node:http'
import {readFile, mkdir, writeFile} from 'node:fs/promises'
import {extname, join, normalize} from 'node:path'
import {chromium} from 'playwright'

const ROOT = '.output/public'
/** The file name the "Download CV" button links to: keep in step with useCvLink(). */
const CV_FILE = locale => `cv/leica-florian-robert-cv-${locale}.pdf`
const PAGES = {it: '/cv', en: '/en/cv', ro: '/ro/cv'}
const MAX_PAGES = 1

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ico': 'image/x-icon',
}

/** The generated site, served as Coolify would: `/en/cv` is `/en/cv/index.html`. */
function serve() {
  const server = createServer(async (request, response) => {
    const path = normalize(decodeURIComponent(new URL(request.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '')
    const file = extname(path) ? join(ROOT, path) : join(ROOT, path, 'index.html')
    try {
      const body = await readFile(file)
      response.writeHead(200, {'content-type': TYPES[extname(file)] ?? 'application/octet-stream'}).end(body)
    } catch {
      response.writeHead(404).end()
    }
  })
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)))
}

function fail(message) {
  console.error(`✗ ${message}`)
  process.exitCode = 1
}

const server = await serve()
const origin = `http://127.0.0.1:${server.address().port}`

let browser
try {
  browser = await chromium.launch()
} catch (error) {
  server.close()
  console.error(`✗ Chromium doesn't start: run \`npx playwright install chromium\` (on a bare Linux build, with --with-deps).\n${error.message}`)
  process.exit(1)
}

try {
  await mkdir(join(ROOT, 'cv'), {recursive: true})
  const page = await browser.newPage()
  // the sheet lays out differently on screen (one long page): check it as it prints
  await page.emulateMedia({media: 'print'})

  for (const [locale, path] of Object.entries(PAGES)) {
    const response = await page.goto(origin + path, {waitUntil: 'networkidle'})
    if (!response?.ok()) {
      fail(`${locale}: ${path} is missing from ${ROOT} (${response?.status()}); is it in nitro.prerender.routes?`)
      continue
    }
    // the sheet drops the experiences that don't fit, then marks itself ready
    if (!await page.waitForSelector('[data-cv-ready]', {timeout: 10_000}).then(() => true, () => false)) {
      fail(`${locale}: the CV never got ready (data-cv-ready)`)
      continue
    }

    // the checks a broken page would fail: print nothing rather than a wrong CV
    const sheet = await page.evaluate(() => {
      const side = document.querySelector('[data-cv-side]')
      return {
        name: document.querySelector('h1')?.textContent?.trim(),
        experiences: document.querySelectorAll('[data-cv-experience]').length,
        background: getComputedStyle(document.documentElement).backgroundColor,
        overflow: side ? side.scrollHeight - side.clientHeight : 0,
      }
    })
    if (!sheet.name) {
      fail(`${locale}: the CV has no name (h1)`)
      continue
    }
    if (!sheet.experiences) {
      fail(`${locale}: the CV has no experiences`)
      continue
    }
    if (sheet.background !== 'rgb(255, 255, 255)') {
      fail(`${locale}: the CV is not on white paper (html background ${sheet.background})`)
      continue
    }
    if (sheet.overflow > 0) console.warn(`! ${locale}: the grey column overflows the first page by ${sheet.overflow}px`)

    const pdf = await page.pdf({preferCSSPageSize: true, printBackground: true})
    const pages = pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g)?.length ?? 0
    if (pages > MAX_PAGES) console.warn(`! ${locale}: the CV runs to ${pages} pages, not ${MAX_PAGES}`)

    await writeFile(join(ROOT, CV_FILE(locale)), pdf)
    console.log(`✓ ${CV_FILE(locale)} · ${pages} pages`)
  }
} finally {
  await browser.close()
  server.close()
}
