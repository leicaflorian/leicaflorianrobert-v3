<script setup lang="ts">
import type {BlockStack, Technology} from '~/types/content'

defineProps<{
  block: BlockStack
  /** The label with its number. */
  label?: string
}>()

const technologies = await useCollection<Technology>('technologies')
</script>

<template>
  <section class="border-t border-line">
    <div class="page section-y">
      <UiSectionLabel v-if="label">{{ label }}</UiSectionLabel>
      <UiSectionTitle class="mb-14">{{ block.title }}</UiSectionTitle>
      <div class="flex flex-wrap gap-3">
        <span
          v-for="tech in technologies"
          :key="tech.id"
          class="spring rounded-[10px] border border-line-control bg-surface px-[18px] py-3 text-sm text-ink hover:-translate-y-[3px] hover:border-accent"
        ><span class="text-accent">#</span> {{ tech.name }}</span>
      </div>
    </div>
  </section>
</template>
