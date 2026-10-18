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

const list = useTemplateRef('list')
const bar = useTemplateRef('bar')
const yearInView = useYearInView(list, () => bar.value?.$el)
</script>

<template>
  <section class="border-t border-line">
    <div class="page section-y">
      <div class="mb-14 grid grid-cols-[0.35fr_0.65fr] gap-18 max-[860px]:grid-cols-1">
        <div>
          <UiSectionLabel v-if="label">{{ label }}</UiSectionLabel>
          <UiSectionTitle>{{ block.title }}</UiSectionTitle>
        </div>
        <p v-if="block.text" v-reveal class="m-0 self-end text-[15px] leading-[1.8] text-muted">{{ block.text }}</p>
      </div>
      <!-- sticky under the site header while the list scrolls by -->
      <ExperienceTimeline ref="bar" :experiences="experiences" :active="yearInView" class="sticky top-16 z-30 mb-6 bg-bg/90 pt-10 pb-6 backdrop-blur-md max-[860px]:hidden"/>
      <div ref="list" v-reveal.stagger class="border-t border-line-card">
        <component
          :is="exp.link ? 'a' : 'div'"
          v-for="exp in timeline"
          :id="`exp-${exp.id}`"
          :key="exp.id"
          :data-year="exp.year"
          :href="exp.link ?? undefined"
          :target="exp.link ? '_blank' : undefined"
          :rel="exp.link ? 'noopener' : undefined"
          class="grid scroll-mt-48 grid-cols-[110px_1fr_1fr_32px] items-center gap-6 border-b border-line-card px-4 py-[26px] text-ink transition-[background-color,padding] duration-[450ms] ease-spring hover:bg-surface hover:pl-7 hover:text-ink max-[860px]:scroll-mt-24 max-[860px]:grid-cols-[96px_1fr]"
        >
          <span class="text-[13px] text-accent">{{ periodOf(exp, $t('about.now')) }}</span>
          <span class="text-[17px] font-bold">{{ companyOf(exp) }}</span>
          <span class="text-sm text-muted max-[860px]:col-start-2">{{ exp.role }}</span>
          <span class="text-right text-ghost max-[860px]:hidden">{{ exp.link ? '↗' : '' }}</span>
          <p v-if="exp.description" class="col-start-2 col-end-4 m-0 -mt-3 max-w-[640px] text-sm leading-[1.7] text-subtle max-[860px]:col-end-3 max-[860px]:mt-0">
            {{ exp.description }}
          </p>
        </component>
      </div>
    </div>
  </section>
</template>
