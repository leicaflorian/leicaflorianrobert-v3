<!--
  Images. With a title they sit in the right column, under the text, with their captions;
  without, they span the whole page (three in a row: a wide one and two narrow).
-->
<script setup lang="ts">
import type {BlockGallery} from '~/types/content'

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
</script>

<template>
  <BlocksRow v-if="block.title" :label="label" :title="block.title">
    <p v-for="(paragraph, i) in paragraphs(block.text)" :key="i" class="m-0" v-html="highlight(paragraph)"/>
    <div class="mt-3 grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-5">
      <div v-for="(slot, i) in slots" :key="i" class="flex flex-col gap-2.5">
        <div class="aspect-4/3 overflow-hidden rounded-xl border border-line-card">
          <UiMediaImage :id="slot.image" :alt="plain(slot.caption)" :width="800" class="object-left-top"/>
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
        <UiMediaImage :id="slot.image" :alt="plain(slot.caption)" :width="900"/>
      </div>
    </div>
  </section>
</template>
