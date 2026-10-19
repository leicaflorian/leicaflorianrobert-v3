// Repairs the files uploaded without a media type (as the seed did before it set one): Directus
// stored them as `application/octet-stream`, with no width or height, so it served them as
// downloads and ignored `?width=`, `?format=`... It uploads each one again over itself, with
// its type: same id and name, and Directus reads its size. Run it once per Directus.
//
//   node directus/scripts/fix-file-types.mjs
//   DIRECTUS_URL=https://cms.leicaflorianrobert.dev DIRECTUS_TOKEN=... node directus/scripts/fix-file-types.mjs

import {api, authToken, DIRECTUS_URL, mimeType, waitForDirectus} from './api.mjs'

await waitForDirectus()
const files = await api('GET', '/files?filter[type][_eq]=application/octet-stream&fields=id,filename_disk,filename_download&limit=-1')
console.log(`${files.length} files without a media type`)

for (const {id, filename_disk, filename_download} of files) {
  // the name on disk keeps the extension the upload had
  const type = mimeType(filename_disk)
  if (type === 'application/octet-stream') {
    console.log(`- ${filename_download}: unknown extension, skipped`)
    continue
  }
  const headers = {Authorization: `Bearer ${await authToken()}`}
  const original = await fetch(`${DIRECTUS_URL}/assets/${id}`, {headers})
  if (!original.ok) throw new Error(`Download of ${filename_download} failed: ${original.status}`)

  const form = new FormData()
  form.append('file', new Blob([await original.arrayBuffer()], {type}), filename_download)
  const response = await fetch(`${DIRECTUS_URL}/files/${id}`, {method: 'PATCH', headers, body: form})
  if (!response.ok) throw new Error(`Upload of ${filename_download} failed: ${await response.text()}`)
  // the upload renames the file after the form's file name; make sure it keeps its own
  await api('PATCH', `/files/${id}`, {filename_download})
  console.log(`✓ ${filename_download} → ${type}`)
}
