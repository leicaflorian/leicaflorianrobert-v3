<script setup lang="ts">
import type {BlockStack, Technology} from '~/types/content'

defineProps<{block: BlockStack}>()

const technologies = await useCollection<Technology>('technologies')
const groups = computed(() => groupTechnologies(technologies.value))
</script>

<template>
  <BlocksLegacyHeading>{{ block.title }}</BlocksLegacyHeading>
  <p v-for="{group, items} in groups" :key="group" class="m-0 mb-2 text-base">
    <b>{{ $t(`about.stack.${group}`) }}:</b> {{ items.map(t => t.name).join(', ') }}.
  </p>
</template>
