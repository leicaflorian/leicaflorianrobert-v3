<script setup lang="ts">
import type {BlockContactForm} from '~/types/content'

defineProps<{block: BlockContactForm}>()
</script>

<template>
  <BlocksLegacyHeading>{{ block.title }}</BlocksLegacyHeading>
  <p v-if="block.text" class="m-0 mb-3">{{ block.text }}</p>
  <LegacyForm/>
  <template v-if="block.steps">
    <p v-if="block.steps_title" class="m-0 mt-4"><b>{{ block.steps_title }}:</b></p>
    <ol class="m-0 list-decimal pl-[26px]">
      <li v-for="(step, i) in lines(block.steps)" :key="i">{{ step }}</li>
    </ol>
  </template>
</template>
