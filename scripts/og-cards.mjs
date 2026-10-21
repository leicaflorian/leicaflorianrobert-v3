// Draws the social card of every generated page that asks for one, into .output/public/og/.
// Runs after `nuxt generate` (npm run generate); `npm run og:cards` redoes only the cards.
// A page asks with `<meta name="og-card">` (the card's data, set in pages/[...slug].vue) and
// points `og:image` at the PNG it expects: the card is saved at that same path.
//
//   node scripts/og-cards.mjs
//
// Needs Chromium (npx playwright install chromium), Google Fonts and Directus for the screenshots.

import {mkdir, readdir, readFile, writeFile} from 'node:fs/promises'
import {dirname, join} from 'node:path'
import {CvError, launchBrowser} from './cv-print.mjs'

const ROOT = '.output/public'
const SIZE = {width: 1200, height: 630}

/** Every `index.html` under the generated site. */
async function pages(dir = ROOT) {
  const found = []
  for (const entry of await readdir(dir, {withFileTypes: true})) {
    const path = join(dir, entry.name)
    if (entry.isDirectory() && !entry.name.startsWith('_')) found.push(...await pages(path))
    else if (entry.name === 'index.html') found.push(path)
  }
  return found
}

const ENTITIES = {'&quot;': '"', '&#x27;': '\'', '&#39;': '\'', '&lt;': '<', '&gt;': '>', '&amp;': '&'}
const unescape = text => text.replace(/&(?:quot|#x27|#39|lt|gt|amp);/g, entity => ENTITIES[entity])
const meta = (html, attribute, name) => html.match(new RegExp(`<meta[^>]*${attribute}="${name}"[^>]*content="([^"]*)"`))?.[1]

const cards = []
for (const file of await pages()) {
  const html = await readFile(file, 'utf8')
  const data = meta(html, 'name', 'og-card')
  if (!data) continue
  const image = meta(html, 'property', 'og:image')
  if (!image) throw new Error(`${file}: an og-card meta but no og:image`)
  cards.push({out: join(ROOT, new URL(unescape(image)).pathname), card: JSON.parse(unescape(data))})
}
if (!cards.length) throw new Error(`No og-card pages in ${ROOT}: run nuxt generate first`)

const template = await readFile(new URL('./og-card.html', import.meta.url), 'utf8')

let browser
try {
  browser = await launchBrowser()
} catch (error) {
  if (!(error instanceof CvError)) throw error
  console.error(`✗ ${error.message}`)
  process.exit(1)
}

try {
  const page = await browser.newPage({viewport: SIZE})
  await page.setContent(template, {waitUntil: 'networkidle'})
  for (const {out, card} of cards) {
    try {
      await page.evaluate(card => window.render(card), card)
      await mkdir(dirname(out), {recursive: true})
      await writeFile(out, await page.screenshot({type: 'png'}))
      console.log(`✓ ${out.slice(ROOT.length)}`)
    } catch (error) {
      // a page pointing at a card that isn't there would share a broken preview
      console.error(`✗ ${out.slice(ROOT.length)}: ${error.message}`)
      process.exitCode = 1
    }
  }
} finally {
  await browser.close()
}
