<!--
  Images of the Directus library opened over the page, as large as the viewport. Esc, the
  close button or a click beside the image close it; with several images the arrows
  (and ← →) move between them. `data-lenis-prevent`: the wheel doesn't scroll the page below.
  The transitions are in main.css (`.lightbox`).
-->
<script setup lang="ts">
import type {FileId} from '~/types/content'

const props = defineProps<{images: {id: FileId, caption: string}[]}>()
/** The open image, `null` when closed. */
const index = defineModel<number | null>({required: true})

const dialog = ref<HTMLDialogElement>()
const current = computed(() => index.value === null ? null : props.images[index.value] ?? null)
/** Where the next image comes from: 1 from the right, -1 from the left. */
const direction = ref(1)
/** Fading out: the dialog closes when the animation ends. */
const closing = ref(false)

watch(index, (value) => {
  const el = dialog.value
  if (!el) return
  if (value !== null) {
    closing.value = false
    if (!el.open) el.showModal()
  } else if (el.open) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) el.close()
    else closing.value = true
  }
  document.documentElement.classList.toggle('overflow-hidden', value !== null)
})
onBeforeUnmount(() => document.documentElement.classList.remove('overflow-hidden'))

function onAnimationEnd() {
  if (!closing.value) return
  closing.value = false
  dialog.value?.close()
}

function step(by: number) {
  if (index.value === null) return
  direction.value = by
  index.value = (index.value + by + props.images.length) % props.images.length
}

function onKey(event: KeyboardEvent) {
  if (props.images.length < 2) return
  if (event.key === 'ArrowRight') step(1)
  else if (event.key === 'ArrowLeft') step(-1)
}
</script>

<template>
  <dialog
    ref="dialog"
    data-lenis-prevent
    class="lightbox fixed inset-0 m-0 size-full max-h-none max-w-none overflow-hidden bg-bg p-0 text-ink backdrop:bg-transparent"
    :class="{'lightbox-closing': closing}"
    :style="{'--lightbox-dir': direction}"
    @cancel.prevent="index = null"
    @close="index = null"
    @keydown="onKey"
    @animationend.self="onAnimationEnd"
  >
    <div class="lightbox-stage flex size-full flex-col items-center justify-center px-16 py-14 max-[860px]:px-4" @click.self="index = null">
      <Transition name="lightbox-image" mode="out-in">
        <div v-if="current?.id" :key="index ?? -1" class="flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-4" @click.self="index = null">
          <NuxtImg
            :src="current.id"
            :alt="plain(current.caption)"
            :width="2400"
            class="block min-h-0 max-w-full flex-1 object-contain"
            @click.self="index = null"
          />
          <p v-if="current.caption" class="m-0 max-w-[720px] text-center text-xs text-subtle" v-html="highlight(current.caption, 'text-accent')"/>
        </div>
      </Transition>
    </div>
    <button type="button" class="spring absolute top-4 right-4 rounded-lg border border-line-control bg-surface px-3 py-2 text-xs hover:text-accent" @click="index = null">
      {{ $t('lightbox.close') }} ✕
    </button>
    <template v-if="images.length > 1">
      <button type="button" :aria-label="$t('lightbox.previous')" class="spring absolute top-1/2 left-4 -translate-y-1/2 rounded-lg border border-line-control bg-surface p-3 hover:text-accent" @click="step(-1)">
        <UiArrowIcon direction="left"/>
      </button>
      <button type="button" :aria-label="$t('lightbox.next')" class="spring absolute top-1/2 right-4 -translate-y-1/2 rounded-lg border border-line-control bg-surface p-3 hover:text-accent" @click="step(1)">
        <UiArrowIcon/>
      </button>
    </template>
  </dialog>
</template>
