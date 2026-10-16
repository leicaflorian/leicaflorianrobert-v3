<script setup lang="ts">
import type {BlockExperiences, Experience} from '~/types/content'

defineProps<{
  block: BlockExperiences
  /** The label with its number. */
  label?: string
}>()

const experiences = await useCollection<Experience>('experiences')
/** Most recent first; those without a year at the end. */
const timeline = computed(() => [...experiences.value].reverse())
</script>

<template>
  <section class="border-t border-line">
    <div class="page section-y">
      <div class="mb-14 grid grid-cols-[0.35fr_0.65fr] gap-18 max-[860px]:grid-cols-1">
        <div>
          <UiSectionLabel v-if="label">{{ label }}</UiSectionLabel>
          <UiSectionTitle>{{ block.title }}</UiSectionTitle>
        </div>
        <p v-if="block.text" class="m-0 self-end text-[15px] leading-[1.8] text-muted">{{ block.text }}</p>
      </div>
      <div class="border-t border-line-card">
        <component
          :is="exp.link ? 'a' : 'div'"
          v-for="exp in timeline"
          :key="exp.id"
          :href="exp.link ?? undefined"
          :target="exp.link ? '_blank' : undefined"
          :rel="exp.link ? 'noopener' : undefined"
          class="grid grid-cols-[100px_1fr_1fr_32px] items-center gap-6 border-b border-line-card px-4 py-[26px] text-ink transition-[background-color,padding] duration-[450ms] ease-spring hover:bg-surface hover:pl-7 hover:text-ink max-[860px]:grid-cols-[64px_1fr]"
        >
          <span class="text-[13px] text-accent">{{ exp.year ?? '—' }}</span>
          <span class="text-[17px] font-bold">{{ exp.company }}</span>
          <span class="text-sm text-muted max-[860px]:col-start-2">{{ exp.role }}</span>
          <span class="text-right text-ghost max-[860px]:hidden">{{ exp.link ? '↗' : '' }}</span>
        </component>
      </div>
    </div>
  </section>
</template>
