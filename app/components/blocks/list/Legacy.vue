<script setup lang="ts">
import type {BlockList} from '~/types/content'

defineProps<{block: BlockList}>()
</script>

<template>
  <BlocksLegacyHeading>{{ block.title }}</BlocksLegacyHeading>
  <ul class="m-0 list-disc pl-[22px]">
    <li v-for="(line, i) in lines(block.items)" :key="i">{{ plain(line) }}</li>
  </ul>
</template>
