<!--
  The Contact map: Italy and its neighbours in characters, a wave spreading from the pin.
  The grid is precomputed (app/assets/ascii-map.json, from scripts/ascii-map.mjs), so the
  page draws it on a canvas without loading any map library. Animated only while visible;
  with prefers-reduced-motion it stays still.
-->
<script setup lang="ts">
import map from '~/assets/ascii-map.json'

defineProps<{label: string}>()

const canvas = useTemplateRef('canvas')
let colors: Record<'land' | 'pin' | 'near' | 'sea' | 'accent' | 'wave', string>
let cell = 0

const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(`--color-${name}`).trim()

/** Sizes the canvas to its width and the device pixel ratio. */
function layout() {
  const el = canvas.value
  if (!el) return
  const width = el.clientWidth || 400
  const dpr = Math.min(devicePixelRatio || 1, 2)
  cell = width / map.cols
  el.width = width * dpr
  el.height = cell * map.cellH * map.rows * dpr
  const ctx = el.getContext('2d')!
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.font = `500 ${cell * 1.55}px 'JetBrains Mono', ui-monospace, monospace`
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
}

/** One frame; `time` null draws it still, without the wave. */
function draw(time: number | null) {
  const ctx = canvas.value?.getContext('2d')
  if (!ctx || !cell) return
  const height = cell * map.cellH
  ctx.clearRect(0, 0, map.cols * cell, map.rows * height)
  const wave = time === null ? -1 : (time / 90) % 40
  map.grid.forEach((line, r) => {
    for (let q = 0; q < map.cols; q++) {
      const kind = line[q]
      const distance = Math.hypot(q - map.pin.x, (r - map.pin.y) * map.cellH)
      let char: string
      let colour: string
      if (kind === '#') [char, colour] = distance < 9 ? ['@', colors.pin] : ['#', colors.land]
      else if (kind === '+') [char, colour] = ['+', colors.near]
      else if ((q + r) % 2) continue
      else [char, colour] = ['·', colors.sea]
      if (wave >= 0 && Math.abs(distance - wave) < 0.9) colour = kind === ' ' ? colors.wave : colors.accent
      ctx.fillStyle = colour
      ctx.fillText(char, (q + 0.5) * cell, (r + 0.5) * height)
    }
  })
  ctx.fillStyle = colors.accent
  const blink = time === null || Math.floor(time / 500) % 2 === 0
  ctx.fillText(blink ? '◉' : '●', (map.pin.x + 0.5) * cell, (map.pin.y + 0.5) * height)
}

let observer: ResizeObserver | undefined
onMounted(() => {
  colors = {land: css('subtle'), pin: css('ink'), near: css('map-near'), sea: css('map-sea'), accent: css('accent'), wave: css('map-wave')}
  const redraw = () => {
    layout()
    draw(null)
  }
  observer = new ResizeObserver(redraw)
  if (canvas.value) observer.observe(canvas.value)
  // the characters need the site's font: draw again once it is there
  document.fonts?.ready.then(redraw)
})
onBeforeUnmount(() => observer?.disconnect())

useVisibleInterval(canvas, () => draw(performance.now()), 40)
</script>

<template>
  <canvas
    ref="canvas"
    role="img"
    :aria-label="label"
    class="block w-full"
    :style="{aspectRatio: `${map.cols} / ${map.rows * map.cellH}`}"
  />
</template>
