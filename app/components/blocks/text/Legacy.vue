<script setup lang="ts">
import type {BlockText} from '~/types/content'

defineProps<{block: BlockText}>()
</script>

<template>
  <BlocksLegacyHeading>{{ block.title }}</BlocksLegacyHeading>
  <p v-for="(paragraph, i) in paragraphs(block.text)" :key="i" class="m-0 mb-3">{{ plain(paragraph) }}</p>
</template>
