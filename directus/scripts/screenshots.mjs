// Takes a screenshot of the website of every project that has no image yet and uploads it
// to Directus, linked to the project. Skips the typographic ones, whose cover is drawn in code. Uses headless Chrome with a temporary profile
// (it doesn't touch your everyday Chrome).
//
//   node directus/scripts/screenshots.mjs           only projects without an image
//   node directus/scripts/screenshots.mjs --all     redoes all screenshots
//   CHROME=/path/to/chrome node directus/scripts/screenshots.mjs
//
// Screenshots are a first pass: review them by hand (cookie banners,
// login pages, websites no longer online).

import {execFile} from 'node:child_process'
import {mkdtemp, readFile, rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {promisify} from 'node:util'
import {api, authToken, DIRECTUS_URL, waitForDirectus} from './api.mjs'

const run = promisify(execFile)
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const ALL = process.argv.includes('--all')

/** Window sizes: 16:10 for websites, 9:19.5 for apps (Chrome won't go below 500px). */
const SIZES = {laptop: [1600, 1000], none: [1600, 1000], phone: [500, 1083]}

async function screenshot(url, [width, height], dir) {
  const file = join(dir, 'shot.png')
  await run(CHROME, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--mute-audio',
    `--user-data-dir=${join(dir, 'profile')}`,
    `--window-size=${width},${height}`,
    '--virtual-time-budget=8000',
    `--screenshot=${file}`,
    url,
  ], {timeout: 60_000})
  return readFile(file)
}

async function upload(bytes, title) {
  const form = new FormData()
  form.append('title', title)
  form.append('file', new Blob([bytes], {type: 'image/png'}), `${title}.png`)
  const response = await fetch(`${DIRECTUS_URL}/files`, {
    method: 'POST',
    headers: {Authorization: `Bearer ${await authToken()}`},
    body: form,
  })
  if (!response.ok) throw new Error(`Upload failed: ${await response.text()}`)
  return (await response.json()).data.id
}

await waitForDirectus()
const projects = await api('GET', '/items/projects?fields=id,slug,url,mockup,image,case_study,typographic&sort=sort&limit=-1')
const dir = await mkdtemp(join(tmpdir(), 'lfr-shots-'))

try {
  for (const project of projects) {
    if (project.case_study) continue // V3 is this site: its screenshot is taken after release
    if (project.typographic) continue // their cover is drawn in code, whatever the image
    if (project.image && !ALL) continue
    try {
      const bytes = await screenshot(project.url, SIZES[project.mockup] ?? SIZES.none, dir)
      const fileId = await upload(bytes, `progetto-${project.slug}`)
      await api('PATCH', `/items/projects/${project.id}`, {image: fileId})
      console.log(`+ ${project.slug}`)
    } catch (error) {
      console.log(`! ${project.slug}: ${error.message.split('\n')[0]}`)
    }
  }
} finally {
  await rm(dir, {recursive: true, force: true})
}
