<script setup lang="ts">
import type {BlockStack, Technology} from '~/types/content'

defineProps<{block: BlockStack}>()

const technologies = await useCollection<Technology>('technologies')
</script>

<template>
  <BlocksLegacyHeading>{{ block.title }}</BlocksLegacyHeading>
  <p class="m-0 text-base">{{ technologies.map(t => t.name).join(', ') }}.</p>
</template>
