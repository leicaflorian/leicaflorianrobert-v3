<!--
  A photo redrawn as ASCII characters on a canvas (from design/ascii-portrait.js).
  Native: it appears row by row, with random glitches, and turns orange under the mouse.
  Legacy: black on white and still. The image must be same-origin (public/), since the
  canvas reads its pixels.
-->
<script setup lang="ts">
const props = withDefaults(defineProps<{
  src: string
  /** Characters per row. */
  cols?: number
  variant?: 'native' | 'legacy'
  /** Width / height of the image: the space is reserved before it loads. */
  aspect?: number
  label: string
}>(), {cols: 84, variant: 'native', aspect: 1600 / 2008})

/** From dark to light: the denser the character, the brighter the pixel (inverted in legacy). */
const RAMP = ' .\'`:-~=+*cox#%&8@'
const GLYPHS = '01<>/\\{}[]$#_=+*'
/** A character cell is taller than wide. */
const CELL_H = 1.75
const LO = [0x2E, 0x2E, 0x33]
const HI = [0xED, 0xEB, 0xE6]
const ACCENT = [0xFF, 0x5B, 0x14]

type Rgb = number[]
const mix = (a: Rgb, b: Rgb, t: number) =>
  `rgb(${a[0]! + (b[0]! - a[0]!) * t | 0},${a[1]! + (b[1]! - a[1]!) * t | 0},${a[2]! + (b[2]! - a[2]!) * t | 0})`

const root = useTemplateRef<HTMLElement>('root')
const canvas = useTemplateRef<HTMLCanvasElement>('canvas')

let cleanup: (() => void) | undefined
onBeforeUnmount(() => cleanup?.())

onMounted(() => {
  const el = root.value!
  const ctx = canvas.value!.getContext('2d')!
  const legacy = props.variant === 'legacy'
  const still = legacy || matchMedia('(prefers-reduced-motion: reduce)').matches
  const cols = props.cols

  let rows = 0
  let lum = new Float32Array(0)
  let cw = 0
  let ch = 0
  let mouse: {x: number, y: number} | null = null
  let visible = false
  let start = 0
  let dirty = true
  let raf = 0
  let disposed = false
  const glitch = new Map<number, number>()

  /** Brightness per cell, from 0.1 to 1; -1 where the photo is transparent. */
  function sample(img: HTMLImageElement) {
    rows = Math.round(cols * (img.height / img.width) / CELL_H)
    const small = document.createElement('canvas')
    small.width = cols
    small.height = rows
    const sctx = small.getContext('2d', {willReadFrequently: true})!
    sctx.drawImage(img, 0, 0, cols, rows)
    const data = sctx.getImageData(0, 0, cols, rows).data
    lum = new Float32Array(cols * rows)
    let min = 1
    let max = 0
    for (let i = 0; i < lum.length; i++) {
      const alpha = data[i * 4 + 3]! / 255
      const l = (0.299 * data[i * 4]! + 0.587 * data[i * 4 + 1]! + 0.114 * data[i * 4 + 2]!) / 255
      lum[i] = alpha < 0.15 ? -1 : l
      if (alpha >= 0.15) {
        min = Math.min(min, l)
        max = Math.max(max, l)
      }
    }
    for (let i = 0; i < lum.length; i++) {
      if (lum[i]! >= 0) lum[i] = Math.pow((lum[i]! - min) / (max - min || 1), 0.85) * 0.9 + 0.1
    }
  }

  function layout() {
    if (!rows) return
    const width = el.clientWidth || 400
    const dpr = Math.min(devicePixelRatio || 1, 2)
    cw = width / cols
    ch = cw * CELL_H
    canvas.value!.width = width * dpr
    canvas.value!.height = ch * rows * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.font = legacy ? `bold ${cw * 1.68}px 'Courier New', Courier, monospace` : `500 ${cw * 1.62}px 'JetBrains Mono', ui-monospace, monospace`
    ctx.textBaseline = 'top'
    dirty = true
  }

  function draw(time: number) {
    const reveal = still ? rows : Math.min(rows, ((time - start) / 1600) * rows)
    if (!still && Math.random() < 0.6) {
      for (let k = 0; k < 6; k++) {
        const i = Math.random() * lum.length | 0
        if (lum[i]! > 0.2) glitch.set(i, time + 120 + Math.random() * 220)
      }
    }
    ctx.clearRect(0, 0, cols * cw, rows * ch)
    const pointer = legacy ? null : mouse
    const radius = 9
    for (let y = 0; y < rows && y <= reveal; y++) {
      const edge = reveal - y < 2 && reveal < rows
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x
        const l = lum[i]!
        if (l < 0) continue
        if (legacy) {
          const c = RAMP[Math.min(RAMP.length - 1, (1 - l) * 0.95 * RAMP.length | 0)]!
          if (c !== ' ') {
            ctx.fillStyle = '#000'
            ctx.fillText(c, x * cw, y * ch)
          }
          continue
        }
        let c = RAMP[Math.min(RAMP.length - 1, l * RAMP.length | 0)]!
        let color = mix(LO, HI, l)
        const until = glitch.get(i)
        if (until) {
          if (until < time) glitch.delete(i)
          else {
            c = GLYPHS[Math.random() * GLYPHS.length | 0]!
            color = mix(LO, ACCENT, 0.85)
          }
        }
        if (pointer) {
          const dx = x - pointer.x * cols
          const dy = (y - pointer.y * rows) * CELL_H
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < radius) {
            const k = 1 - d / radius
            color = mix(HI, ACCENT, Math.min(1, k * 1.6))
            if (k > 0.55) c = RAMP[Math.min(RAMP.length - 1, (l + 0.25) * RAMP.length | 0)]!
          }
        }
        if (edge) {
          color = mix(LO, ACCENT, 1)
          c = GLYPHS[(x + y) % GLYPHS.length]!
        }
        if (c === ' ') continue
        ctx.fillStyle = color
        ctx.fillText(c, x * cw, y * ch)
      }
    }
  }

  // ~30fps, only while on screen; legacy draws only when the size changes
  let last = 0
  const tick = (time: number) => {
    raf = requestAnimationFrame(tick)
    if (!visible || !rows || time - last < 33) return
    if (still && !dirty) return
    last = time
    dirty = false
    draw(time)
  }

  const onMove = (e: PointerEvent) => {
    const r = canvas.value!.getBoundingClientRect()
    mouse = {x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height}
  }
  const onLeave = () => {
    mouse = null
  }
  el.addEventListener('pointermove', onMove)
  el.addEventListener('pointerleave', onLeave)

  const resize = new ResizeObserver(layout)
  resize.observe(el)
  const seen = new IntersectionObserver(([entry]) => {
    visible = Boolean(entry?.isIntersecting)
    if (visible && !start) start = performance.now()
  }, {threshold: 0.15})
  seen.observe(el)

  const img = new Image()
  img.onload = async () => {
    // the characters are measured with the site's font: wait for it
    await document.fonts?.ready
    if (disposed) return
    sample(img)
    layout()
    raf = requestAnimationFrame(tick)
  }
  img.src = props.src

  cleanup = () => {
    disposed = true
    cancelAnimationFrame(raf)
    resize.disconnect()
    seen.disconnect()
    el.removeEventListener('pointermove', onMove)
    el.removeEventListener('pointerleave', onLeave)
  }
})
</script>

<template>
  <div ref="root" role="img" :aria-label="label" class="relative" :style="{aspectRatio: aspect}">
    <canvas ref="canvas" class="block size-full"/>
  </div>
</template>
