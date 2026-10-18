<!--
  Images. With a title they sit in the right column, under the text, with their captions;
  without, they span the whole page (three in a row: a wide one and two narrow).
-->
<script setup lang="ts">
import type {BlockGallery, FileId} from '~/types/content'

const props = defineProps<{
  block: BlockGallery
  /** The label with its number. */
  label?: string
}>()

/** One slot per image or caption: a caption without an image shows the placeholder. */
const slots = computed(() => {
  const captions = lines(props.block.captions)
  const count = Math.max(props.block.images.length, captions.length)
  return Array.from({length: count}, (_, i) => ({image: props.block.images[i] ?? null, caption: captions[i] ?? ''}))
})

/** The images that exist, opened large on click; `open` is the index among them. */
const zoomable = computed(() => slots.value.flatMap(slot => slot.image ? [{id: slot.image, caption: slot.caption}] : []))
const open = ref<number | null>(null)
function zoom(image: FileId) {
  open.value = zoomable.value.findIndex(item => item.id === image)
}
</script>

<template>
  <BlocksRow v-if="block.title" :label="label" :title="block.title">
    <p v-for="(paragraph, i) in paragraphs(block.text)" :key="i" class="m-0" v-html="highlight(paragraph)"/>
    <ul v-if="block.items" class="m-0 flex list-none flex-col border-t border-line-card p-0">
      <li v-for="(line, i) in lines(block.items)" :key="i" class="border-b border-line-card py-[18px]">
        <span class="text-accent">›</span> <span v-html="highlight(line)"/>
      </li>
    </ul>
    <div v-if="slots.length" class="mt-3 grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-5">
      <div v-for="(slot, i) in slots" :key="i" class="flex flex-col gap-2.5">
        <!-- a single image is a wide one (a diagram, desktop and phone together): shown whole, at its own shape -->
        <div class="overflow-hidden rounded-xl border border-line-card" :class="slots.length > 1 ? 'aspect-4/3' : slot.image ? '' : 'aspect-16/10'">
          <button v-if="slot.image" type="button" :aria-label="$t('lightbox.open')" class="block size-full cursor-zoom-in" @click="zoom(slot.image)">
            <UiMediaImage :id="slot.image" :alt="plain(slot.caption)" :width="slots.length === 1 ? 1200 : 800" class="object-left-top"/>
          </button>
          <UiMediaImage v-else :id="slot.image" :alt="plain(slot.caption)" :width="800"/>
        </div>
        <span class="text-xs text-subtle" v-html="highlight(slot.caption, 'text-accent')"/>
      </div>
    </div>
  </BlocksRow>

  <section v-else>
    <div
      v-reveal.stagger
      class="page grid gap-6 pb-40 max-[860px]:pb-24"
      :class="slots.length === 3
        ? 'grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] max-[860px]:grid-cols-2 max-[860px]:[&>*:first-child]:col-span-2'
        : 'grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))]'"
    >
      <div v-for="(slot, i) in slots" :key="i" class="h-[340px] overflow-hidden rounded-2xl">
        <button v-if="slot.image" type="button" :aria-label="$t('lightbox.open')" class="block size-full cursor-zoom-in" @click="zoom(slot.image)">
          <UiMediaImage :id="slot.image" :alt="plain(slot.caption)" :width="900"/>
        </button>
        <UiMediaImage v-else :id="slot.image" :alt="plain(slot.caption)" :width="900"/>
      </div>
    </div>
  </section>

  <UiLightbox v-model="open" :images="zoomable"/>
</template>
