// Prints the CV pages of the generated site to PDF, one per language, next to the site.
// Runs after `nuxt generate` (npm run generate); `npm run cv:pdf` redoes only the PDFs.
//
//   node scripts/cv-pdf.mjs
//
// Needs Chromium: npx playwright install chromium

import {createServer} from 'node:http'
import {readFile, mkdir, writeFile} from 'node:fs/promises'
import {extname, join, normalize} from 'node:path'
import {CV_FILE, CV_PAGES, CvError, launchBrowser, printCv} from './cv-print.mjs'

const ROOT = '.output/public'

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

const server = await serve()
const origin = `http://127.0.0.1:${server.address().port}`

let browser
try {
  browser = await launchBrowser()
} catch (error) {
  server.close()
  console.error(`✗ ${error.message}`)
  process.exit(1)
}

try {
  await mkdir(join(ROOT, 'cv'), {recursive: true})
  for (const [locale, path] of Object.entries(CV_PAGES)) {
    try {
      const {pdf, pages} = await printCv(browser, origin + path)
      await writeFile(join(ROOT, CV_FILE(locale)), pdf)
      console.log(`✓ ${CV_FILE(locale)} · ${pages} pages`)
    } catch (error) {
      if (!(error instanceof CvError)) throw error
      // print nothing rather than a wrong or cut-off CV
      console.error(`✗ ${locale}: ${error.message}`)
      process.exitCode = 1
    }
  }
} finally {
  await browser.close()
  server.close()
}
