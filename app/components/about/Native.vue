<script setup lang="ts">
import type {Experience, PageAbout, Technology} from '~/types/content'

const props = defineProps<{
  page: PageAbout
  experiences: Experience[]
  technologies: Technology[]
  years: number
}>()

const {tm, rt} = useI18n()
const galleryLabels = computed(() => (tm('about.gallery') as unknown as Parameters<typeof rt>[0][]).map(l => rt(l)))
const gallery = computed(() => [props.page.gallery_1, props.page.gallery_2, props.page.gallery_3])
/** Most recent first; those without a year at the end. */
const timeline = computed(() => [...props.experiences].reverse())
</script>

<template>
  <section>
    <div class="page grid grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] items-center gap-18 pb-30 pt-28 max-[860px]:grid-cols-1">
      <div>
        <UiSectionLabel>{{ $t('about.comment') }}</UiSectionLabel>
        <UiPageTitle size="lg">{{ $t('about.title') }}</UiPageTitle>
        <p class="m-0 mt-8 max-w-[520px] text-[15px] leading-[1.8] text-muted">{{ page.intro }}</p>
        <div class="mt-12 flex flex-wrap gap-12">
          <div>
            <p class="m-0 text-[56px] font-extrabold leading-none tracking-[-0.04em] text-accent">{{ years }}</p>
            <p class="m-0 mt-2.5 text-xs text-subtle">{{ $t('about.years') }}</p>
          </div>
          <div>
            <p class="m-0 text-[56px] font-extrabold leading-none tracking-[-0.04em] text-ink">{{ technologies.length }}</p>
            <p class="m-0 mt-2.5 text-xs text-subtle">{{ $t('about.tech') }}</p>
          </div>
        </div>
      </div>
      <div class="relative">
        <div class="absolute inset-[12%_6%_0_6%] rounded-full bg-accent opacity-[0.22] blur-[100px]"/>
        <div class="relative aspect-4/5 overflow-hidden rounded-[20px]">
          <UiMediaImage :id="page.portrait" :alt="$t('about.portrait')" :width="900"/>
        </div>
      </div>
    </div>
  </section>

  <section class="border-t border-line">
    <div class="page section-y grid grid-cols-[minmax(0,0.35fr)_minmax(0,0.65fr)] items-start gap-18 max-[860px]:grid-cols-1">
      <div class="sticky top-24 max-[860px]:static">
        <UiSectionLabel>{{ $t('about.story.label') }}</UiSectionLabel>
        <UiSectionTitle>{{ $t('about.story.title') }}</UiSectionTitle>
      </div>
      <div class="flex flex-col gap-6 text-base leading-[1.85] text-ink-soft">
        <p v-for="(paragraph, i) in paragraphs(page.story)" :key="i" class="m-0">{{ paragraph }}</p>
      </div>
    </div>
    <div class="page grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] gap-6 pb-60 max-[860px]:grid-cols-2 max-[860px]:pb-30 max-[860px]:[&>*:first-child]:col-span-2">
      <div v-for="(image, i) in gallery" :key="i" class="h-[340px] overflow-hidden rounded-2xl">
        <UiMediaImage :id="image" :alt="galleryLabels[i] ?? ''" :width="800"/>
      </div>
    </div>
  </section>

  <section class="border-t border-line">
    <div class="page section-y">
      <div class="mb-14 grid grid-cols-[0.35fr_0.65fr] gap-18 max-[860px]:grid-cols-1">
        <div>
          <UiSectionLabel>{{ $t('about.experiences.label') }}</UiSectionLabel>
          <UiSectionTitle>{{ $t('about.experiences.title') }}</UiSectionTitle>
        </div>
        <p class="m-0 self-end text-[15px] leading-[1.8] text-muted">{{ page.experiences_text }}</p>
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

  <section class="border-t border-line">
    <div class="page section-y">
      <UiSectionLabel>{{ $t('about.stack.label') }}</UiSectionLabel>
      <UiSectionTitle class="mb-14">{{ $t('about.stack.title') }}</UiSectionTitle>
      <div class="flex flex-wrap gap-3">
        <span
          v-for="tech in technologies"
          :key="tech.id"
          class="spring rounded-[10px] border border-line-control bg-surface px-[18px] py-3 text-sm text-ink hover:-translate-y-[3px] hover:border-accent"
        ><span class="text-accent">#</span> {{ tech.name }}</span>
      </div>
    </div>
  </section>

  <SiteCtaBanner :text="page.cta_text"/>
</template>
