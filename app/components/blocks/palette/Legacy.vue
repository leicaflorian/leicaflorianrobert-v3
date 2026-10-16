<script setup lang="ts">
import type {BlockPalette} from '~/types/content'

const props = defineProps<{block: BlockPalette}>()

const names = computed(() => lines(props.block.color_names))
</script>

<template>
  <BlocksLegacyHeading>{{ block.title }}</BlocksLegacyHeading>
  <p v-for="(paragraph, i) in paragraphs(block.text)" :key="i" class="m-0 mb-3">{{ plain(paragraph) }}</p>
  <ul class="m-0 list-disc pl-[22px]">
    <li v-for="(color, i) in lines(block.colors)" :key="color"><code class="font-legacy-mono">{{ color }}</code> {{ names[i] }}</li>
  </ul>
  <p v-if="block.logo_text" class="m-0 mt-3">{{ block.logo_text }}</p>
</template>
