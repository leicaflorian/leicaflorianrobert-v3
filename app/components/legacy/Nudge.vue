<!--
  On a first visit the legacy page glitches every few seconds, and after a while a '90s
  dialog invites the visitor to switch to native. Either answer is saved as the engine choice
  (useEngine), so the nudge never comes back. Client only: the generated HTML doesn't change.
-->
<script setup lang="ts">
import {ENGINE_STORAGE_KEY} from '~/composables/useEngine'

/** When the dialog opens. */
const NUDGE_DELAY_MS = 5000
/** The pause between two glitches is random, within these bounds. */
const GLITCH_MIN_MS = 1500
const GLITCH_MAX_MS = 4000
/** How long the glitch class stays on: the length of `legacy-glitch` in main.css. */
const GLITCH_MS = 260

/** True while the page is glitching: the layout puts `legacy-glitch` on the page. */
const glitch = defineModel<boolean>({default: false})

const {set, toggle} = useEngine()
const dialog = useTemplateRef<HTMLDialogElement>('dialog')
const timers: ReturnType<typeof setTimeout>[] = []

/** The visitor already chose a mode, here or with the engine button. */
function decided() {
  try {
    return localStorage.getItem(ENGINE_STORAGE_KEY) !== null
  } catch {
    return false
  }
}

function stop() {
  timers.forEach(clearTimeout)
  timers.length = 0
  glitch.value = false
}

function scheduleGlitch() {
  timers.push(setTimeout(() => {
    if (decided()) return stop()
    glitch.value = true
    timers.push(setTimeout(() => {
      glitch.value = false
      scheduleGlitch()
    }, GLITCH_MS))
  }, GLITCH_MIN_MS + Math.random() * (GLITCH_MAX_MS - GLITCH_MIN_MS)))
}

function choose(native: boolean) {
  stop()
  dialog.value?.close()
  if (native) toggle()
  else set('legacy')
}

onMounted(() => {
  if (decided()) return
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) scheduleGlitch()
  timers.push(setTimeout(() => {
    if (decided()) return stop()
    dialog.value?.showModal()
  }, NUDGE_DELAY_MS))
})
onBeforeUnmount(stop)
</script>

<template>
  <dialog
    ref="dialog"
    aria-labelledby="legacy-nudge-title"
    class="m-auto w-[min(440px,calc(100vw-32px))] border-2 border-legacy-light border-r-legacy-shadow border-b-legacy-shadow bg-legacy-face p-0.5 font-legacy text-black backdrop:bg-black/40"
    @cancel.prevent="choose(false)"
  >
    <div id="legacy-nudge-title" class="bg-legacy-title px-2 py-1 font-legacy-mono text-sm font-bold text-legacy-light">
      {{ $t('engine.nudge.title') }}
    </div>
    <div class="flex flex-col gap-3 px-4 pb-4 pt-3 text-base">
      <p class="m-0">{{ $t('engine.nudge.text') }}</p>
      <p class="m-0 text-sm text-legacy-note"><i>{{ $t('engine.nudge.hint') }}</i></p>
      <div class="mt-1 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          class="cursor-pointer border-2 border-legacy-light border-r-legacy-shadow border-b-legacy-shadow bg-legacy-face px-4 py-2 font-legacy-mono text-sm text-black active:border-legacy-shadow active:border-r-legacy-light active:border-b-legacy-light"
          @click="choose(false)"
        >
          {{ $t('engine.nudge.decline') }}
        </button>
        <button
          type="button"
          autofocus
          class="cursor-pointer border-2 border-legacy-light border-r-legacy-shadow border-b-legacy-shadow bg-legacy-face px-4 py-2 font-legacy-mono text-sm font-bold text-black outline-1 outline-black outline-offset-[-6px] outline-dotted active:border-legacy-shadow active:border-r-legacy-light active:border-b-legacy-light"
          @click="choose(true)"
        >
          {{ $t('engine.nudge.accept') }}
        </button>
      </div>
    </div>
  </dialog>
</template>
