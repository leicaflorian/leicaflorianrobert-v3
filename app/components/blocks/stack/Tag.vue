<script setup lang="ts">
/*
  A technology in the native Stack. Easter egg: a click glitches it, the box shakes,
  the name splits in two colours and scrambles, then settles back. Off with
  `prefers-reduced-motion`.
*/
const props = defineProps<{
  name: string
  /** Used every day: accent border. */
  daily?: boolean
}>()

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*/<>_'
const TICKS = 10

const shown = ref(props.name)
const glitching = ref(false)
let timer: ReturnType<typeof setInterval> | undefined

/** Each tick reveals a bit more of the name, left to right; the rest is random glyphs. */
function scramble(tick: number) {
  const revealed = Math.floor(props.name.length * tick / TICKS)
  return [...props.name].map((char, i) =>
    i < revealed || char === ' ' ? char : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
  ).join('')
}

function play() {
  if (glitching.value || matchMedia('(prefers-reduced-motion: reduce)').matches) return
  glitching.value = true
  let tick = 0
  timer = setInterval(() => {
    shown.value = scramble(++tick)
    if (tick < TICKS) return
    clearInterval(timer)
    shown.value = props.name
  }, 40)
}

function end(event: AnimationEvent) {
  if (event.animationName === 'tech-glitch') glitching.value = false
}

onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <span
    class="spring cursor-pointer rounded-[10px] border bg-surface px-[18px] py-3 text-sm text-ink select-none hover:-translate-y-[3px] hover:border-accent"
    :class="[daily ? 'border-accent/40' : 'border-line-control', {'tech-glitch': glitching}]"
    @click="play"
    @animationend.self="end"
  ><span class="text-accent">#</span> <span class="tech-glitch-text relative" :data-text="shown">{{ shown }}</span></span>
</template>
