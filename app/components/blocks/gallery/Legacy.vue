<!-- In legacy mode the images give way to the text: a '90s page has few pictures. -->
<script setup lang="ts">
import type {BlockGallery} from '~/types/content'

defineProps<{block: BlockGallery}>()
</script>

<template>
  <template v-if="block.title">
    <BlocksLegacyHeading>{{ block.title }}</BlocksLegacyHeading>
    <p v-for="(paragraph, i) in paragraphs(block.text)" :key="i" class="m-0 mb-3">{{ plain(paragraph) }}</p>
    <ul v-if="block.items" class="m-0 mb-3 list-disc pl-[22px]">
      <li v-for="(line, i) in lines(block.items)" :key="i">{{ plain(line) }}</li>
    </ul>
  </template>
</template>
