<script setup lang="ts">
import type {BlockContactForm} from '~/types/content'

defineProps<{block: BlockContactForm}>()
</script>

<template>
  <BlocksLegacyHeading>{{ block.title }}</BlocksLegacyHeading>
  <p v-if="block.text" class="m-0 mb-3">{{ block.text }}</p>
  <LegacyForm/>
</template>
