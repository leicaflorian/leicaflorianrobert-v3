<script setup lang="ts">
import type {BlockStack, Technology} from '~/types/content'

defineProps<{
  block: BlockStack
  /** The label with its number. */
  label?: string
}>()

const technologies = await useCollection<Technology>('technologies')
const groups = computed(() => groupTechnologies(technologies.value))
</script>

<template>
  <section class="border-t border-line">
    <div class="page section-y">
      <UiSectionLabel v-if="label">{{ label }}</UiSectionLabel>
      <UiSectionTitle class="mb-14">{{ block.title }}</UiSectionTitle>
      <div class="flex flex-col gap-10">
        <div v-for="{group, items} in groups" :key="group">
          <p class="m-0 mb-4 text-[13px] text-subtle lowercase">// {{ $t(`about.stack.${group}`) }}</p>
          <div class="flex flex-wrap gap-3">
            <span
              v-for="tech in items"
              :key="tech.id"
              class="spring rounded-[10px] border bg-surface px-[18px] py-3 text-sm text-ink hover:-translate-y-[3px] hover:border-accent"
              :class="group === 'daily' ? 'border-accent/40' : 'border-line-control'"
            ><span class="text-accent">#</span> {{ tech.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
