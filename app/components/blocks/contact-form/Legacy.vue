<script setup lang="ts">
import type {BlockContactForm} from '~/types/content'

defineProps<{block: BlockContactForm}>()
</script>

<template>
  <BlocksLegacyHeading>{{ block.title }}</BlocksLegacyHeading>
  <p v-if="block.text" class="m-0 mb-3">{{ block.text }}</p>
  <ol v-if="block.steps" class="m-0 mb-3 pl-[26px]">
    <li v-for="(step, i) in lines(block.steps)" :key="i">{{ step }}</li>
  </ol>
  <LegacyForm/>
</template>
