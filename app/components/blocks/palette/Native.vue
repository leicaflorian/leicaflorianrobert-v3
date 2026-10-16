<!-- A project's visual system: the colors, then the logo with a few words about it. -->
<script setup lang="ts">
import type {BlockPalette} from '~/types/content'

const props = defineProps<{
  block: BlockPalette
  /** The label with its number. */
  label?: string
}>()

const swatches = computed(() => {
  const names = lines(props.block.color_names)
  return lines(props.block.colors).map((color, i) => ({color, name: names[i] ?? ''}))
})
</script>

<template>
  <BlocksRow :label="label" :title="block.title">
    <p v-for="(paragraph, i) in paragraphs(block.text)" :key="i" class="m-0" v-html="highlight(paragraph)"/>
    <div v-if="swatches.length" class="mt-3 grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-4">
      <div v-for="swatch in swatches" :key="swatch.color" class="flex flex-col gap-2.5">
        <div class="h-24 rounded-xl border border-line-control" :style="{background: swatch.color}"/>
        <span class="text-[13px] text-ink">{{ swatch.name }}</span>
        <span class="text-xs text-subtle">{{ swatch.color }}</span>
      </div>
    </div>
    <div v-if="block.site_logo || block.logo" class="mt-3 flex flex-wrap items-center gap-7 rounded-[14px] border border-line-card bg-surface p-7">
      <span
        v-if="block.site_logo"
        aria-label="lfr"
        class="inline-flex size-22 shrink-0 items-center justify-center gap-[3px] rounded-[22px] border border-line-control bg-surface-raised text-[30px] font-extrabold leading-none tracking-[-0.06em] text-accent"
      >lfr<span class="mb-7 inline-block h-1 w-[13px] animate-cursor self-end bg-accent"/></span>
      <div v-else class="size-22 shrink-0 overflow-hidden rounded-[22px]">
        <UiMediaImage :id="block.logo" alt="Logo" :width="176"/>
      </div>
      <p v-if="block.logo_text" class="m-0 min-w-[220px] flex-1 text-sm leading-[1.8]">{{ block.logo_text }}</p>
    </div>
  </BlocksRow>
</template>
