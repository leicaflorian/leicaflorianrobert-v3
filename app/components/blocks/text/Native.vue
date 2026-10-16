<script setup lang="ts">
import type {BlockText} from '~/types/content'

defineProps<{
  block: BlockText
  /** The label with its number. */
  label?: string
}>()
</script>

<template>
  <BlocksRow :label="label" :title="block.title">
    <p v-for="(paragraph, i) in paragraphs(block.text)" :key="i" class="m-0" v-html="highlight(paragraph)"/>
  </BlocksRow>
</template>
