// Writes sitemap.xml and robots.txt into the generated site, from the pages `nuxt generate` wrote.
// Runs after `nuxt generate` (npm run generate). Page paths are Directus slugs, so the list
// comes from the generated pages rather than from code: each one is listed at its canonical URL,
// with its translations (the hreflang links useLocaleHead puts in every page). Pages marked
// `noindex` (the CV) are left out.
//
//   node scripts/seo-files.mjs

import {readdir, readFile, writeFile} from 'node:fs/promises'
import {join} from 'node:path'

const ROOT = '.output/public'

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

const escape = text => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const attribute = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1]

const urls = []
for (const file of await pages()) {
  const html = await readFile(file, 'utf8')
  if (/<meta name="robots" content="[^"]*noindex/.test(html)) continue
  const links = html.match(/<link[^>]*rel="(?:canonical|alternate)"[^>]*>/g) ?? []
  const canonical = links.map(tag => attribute(tag, 'rel') === 'canonical' && attribute(tag, 'href')).find(Boolean)
  if (!canonical) throw new Error(`${file}: no canonical link`)
  // the short codes (it, en, ro) and x-default; it-IT and the like say the same
  const alternates = links
    .map(tag => ({lang: attribute(tag, 'hreflang'), href: attribute(tag, 'href')}))
    .filter(({lang, href}) => href && lang && (!lang.includes('-') || lang === 'x-default'))
  urls.push({loc: canonical, alternates})
}
if (!urls.length) throw new Error(`No pages in ${ROOT}: run nuxt generate first`)
urls.sort((a, b) => a.loc.localeCompare(b.loc))

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ...urls.map(({loc, alternates}) => [
    '  <url>',
    `    <loc>${escape(loc)}</loc>`,
    ...alternates.map(({lang, href}) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${escape(href)}"/>`),
    '  </url>',
  ].join('\n')),
  '</urlset>',
  '',
].join('\n')

// the site's own address is the one of its canonical links (i18n baseUrl in nuxt.config.ts)
const origin = new URL(urls[0].loc).origin
const robots = `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`

await writeFile(join(ROOT, 'sitemap.xml'), sitemap)
await writeFile(join(ROOT, 'robots.txt'), robots)
console.log(`sitemap.xml: ${urls.length} pages; robots.txt points to ${origin}/sitemap.xml`)
