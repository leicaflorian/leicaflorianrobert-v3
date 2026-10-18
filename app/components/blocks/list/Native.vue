<script setup lang="ts">
import type {BlockList} from '~/types/content'

defineProps<{
  block: BlockList
  /** The label with its number. */
  label?: string
}>()
</script>

<template>
  <BlocksRow :label="label" :title="block.title">
    <ul class="m-0 flex list-none flex-col border-t border-line-card p-0">
      <li v-for="(line, i) in lines(block.items)" :key="i" class="border-b border-line-card py-[18px]">
        <span class="text-accent">›</span> <span v-html="highlight(line)"/>
      </li>
    </ul>
  </BlocksRow>
</template>
