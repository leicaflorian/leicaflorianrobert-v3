// Builds app/assets/ascii-map.json, the map of the Contact header: Italy and its
// neighbours rasterised on a grid of characters, with the pin on the city. The page only
// draws it, so it needs no map library. Run it again only to move the pin:
//
//   npm i --no-save d3-geo topojson-client world-atlas @napi-rs/canvas
//   node scripts/ascii-map.mjs

import {writeFile} from 'node:fs/promises'
import {createRequire} from 'node:module'
import {createCanvas} from '@napi-rs/canvas'
import {geoMercator, geoPath} from 'd3-geo'
import {feature} from 'topojson-client'

const PIN = {name: 'Schio', lon: 11.357, lat: 45.713}
const COLS = 64
/** A character cell is this many times taller than wide. */
const CELL_H = 1.7
const ITALY = 380
const NEIGHBOURS = [250, 756, 40, 705, 191, 70, 499, 8, 674, 336, 470]

const topo = createRequire(import.meta.url)('world-atlas/countries-110m.json')
const countries = feature(topo, topo.objects.countries).features

const rows = Math.round(COLS * 1.15 / CELL_H)
const width = COLS
const height = Math.round(rows * CELL_H)
const projection = geoMercator().fitExtent([[1, 1], [width - 1, height - 1]], countries.find(f => +f.id === ITALY))

const canvas = createCanvas(width, height)
const ctx = canvas.getContext('2d')
const path = geoPath(projection, ctx)
const fill = (features, colour) => {
  ctx.fillStyle = colour
  for (const f of features) {
    ctx.beginPath()
    path(f)
    ctx.fill()
  }
}
fill(countries.filter(f => NEIGHBOURS.includes(+f.id)), '#f00')
fill(countries.filter(f => +f.id === ITALY), '#0f0')

// one character per cell: '#' Italy, '+' a neighbour, ' ' the sea
const {data} = ctx.getImageData(0, 0, width, height)
const grid = Array.from({length: rows}, (_, r) => {
  const y = Math.min(height - 1, Math.round((r + 0.5) * CELL_H))
  return Array.from({length: COLS}, (_, q) => {
    const i = (y * width + q) * 4
    return data[i + 1] > 120 ? '#' : data[i] > 120 ? '+' : ' '
  }).join('')
})

const [x, y] = projection([PIN.lon, PIN.lat])
const map = {cols: COLS, rows, cellH: CELL_H, pin: {lat: PIN.lat, lon: PIN.lon, x: +x.toFixed(2), y: +(y / CELL_H).toFixed(2)}, grid}
await writeFile(new URL('../app/assets/ascii-map.json', import.meta.url), `${JSON.stringify(map, null, 2)}\n`)
console.log(`ascii-map.json: ${COLS}×${rows}, pin on ${PIN.name}`)
