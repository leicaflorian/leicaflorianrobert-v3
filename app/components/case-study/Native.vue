<script setup lang="ts">
import type {PageCaseStudy} from '~/types/content'

const props = defineProps<{page: PageCaseStudy}>()
const {t} = useI18n()

const facts = computed(() => [
  {label: t('caseStudy.facts.role'), value: props.page.role},
  {label: t('caseStudy.facts.year'), value: props.page.year},
  {label: t('caseStudy.facts.type'), value: props.page.type},
  {label: t('caseStudy.facts.pages'), value: props.page.pages},
])

/** The visual system's colors: they belong to the site, not to the content. */
const swatches = [
  {key: 'bg', color: '#111113'},
  {key: 'surface', color: '#18181B'},
  {key: 'text', color: '#EDEBE6'},
  {key: 'accent', color: '#FF5B14'},
] as const
</script>

<template>
  <section>
    <div class="page pb-18 pt-24">
      <NuxtLinkLocale to="projects" class="inline-flex text-[13px] text-subtle hover:text-accent">{{ $t('caseStudy.back') }}</NuxtLinkLocale>
      <p class="m-0 mb-4 mt-12 text-[13px] text-accent">{{ $t('caseStudy.comment') }}</p>
      <UiPageTitle>{{ page.title }}</UiPageTitle>
      <p class="m-0 mt-8 max-w-[640px] text-[17px] leading-[1.8] text-muted">{{ page.intro }}</p>
      <div class="mt-14 grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-px overflow-hidden rounded-[14px] border border-line-card bg-line-card">
        <div v-for="fact in facts" :key="fact.label" class="bg-surface px-6 py-5">
          <p class="m-0 mb-1.5 text-xs text-dim">{{ fact.label }}</p>
          <p class="m-0 text-sm">{{ fact.value }}</p>
        </div>
      </div>
    </div>
    <div class="page pb-40">
      <div class="aspect-video overflow-hidden rounded-2xl">
        <UiMediaImage :id="page.cover" :alt="$t('caseStudy.shots.cover')" :width="1600"/>
      </div>
    </div>
  </section>

  <CaseStudyRow :label="$t('caseStudy.start.label')" :title="$t('caseStudy.start.title')">
    <p v-for="(paragraph, i) in paragraphs(page.start_text)" :key="i" class="m-0" v-html="highlight(paragraph)"/>
  </CaseStudyRow>

  <CaseStudyRow :label="$t('caseStudy.concept.label')" :title="$t('caseStudy.concept.title')">
    <p v-for="(paragraph, i) in paragraphs(page.concept_text)" :key="i" class="m-0" v-html="highlight(paragraph)"/>
    <div class="mt-3 grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-5">
      <div class="flex flex-col gap-2.5">
        <div class="aspect-4/3 overflow-hidden rounded-xl">
          <UiMediaImage :id="page.shot_legacy" :alt="$t('caseStudy.shots.legacy')" :width="800"/>
        </div>
        <span class="text-xs text-subtle">{{ $t('caseStudy.shots.legacy') }}</span>
      </div>
      <div class="flex flex-col gap-2.5">
        <div class="aspect-4/3 overflow-hidden rounded-xl">
          <UiMediaImage :id="page.shot_native" :alt="$t('caseStudy.shots.native')" :width="800"/>
        </div>
        <span class="text-xs text-accent">{{ $t('caseStudy.shots.native') }}</span>
      </div>
    </div>
  </CaseStudyRow>

  <CaseStudyRow :label="$t('caseStudy.visual.label')" :title="$t('caseStudy.visual.title')">
    <p v-for="(paragraph, i) in paragraphs(page.visual_text)" :key="i" class="m-0" v-html="highlight(paragraph)"/>
    <div class="mt-3 grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-4">
      <div v-for="swatch in swatches" :key="swatch.key" class="flex flex-col gap-2.5">
        <div class="h-24 rounded-xl border border-line-control" :style="{background: swatch.color}"/>
        <span class="text-[13px] text-ink">{{ $t(`caseStudy.visual.swatches.${swatch.key}`) }}</span>
        <span class="text-xs text-subtle">{{ swatch.color }}</span>
      </div>
    </div>
    <div class="mt-3 flex flex-wrap items-center gap-7 rounded-[14px] border border-line-card bg-surface p-7">
      <span
        aria-label="lfr"
        class="inline-flex size-22 shrink-0 items-center justify-center gap-[3px] rounded-[22px] border border-line-control bg-surface-raised text-[30px] font-extrabold leading-none tracking-[-0.06em] text-accent"
      >lfr<span class="mb-7 inline-block h-1 w-[13px] animate-cursor self-end bg-accent"/></span>
      <p class="m-0 min-w-[220px] flex-1 text-sm leading-[1.8]">{{ page.logo_text }}</p>
    </div>
  </CaseStudyRow>

  <CaseStudyRow :label="$t('caseStudy.details.label')" :title="$t('caseStudy.details.title')">
    <ul class="m-0 flex list-none flex-col border-t border-line-card p-0">
      <li v-for="(line, i) in lines(page.details)" :key="i" class="border-b border-line-card py-[18px]">
        <span class="text-accent">›</span> {{ line }}
      </li>
    </ul>
  </CaseStudyRow>

  <section class="border-t border-line">
    <div class="page grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-6 py-40 max-[860px]:py-24">
      <div class="h-[360px] overflow-hidden rounded-2xl">
        <UiMediaImage :id="page.shot_about" :alt="$t('caseStudy.shots.about')" :width="900"/>
      </div>
      <div class="h-[360px] overflow-hidden rounded-2xl">
        <UiMediaImage :id="page.shot_mobile" :alt="$t('caseStudy.shots.mobile')" :width="900"/>
      </div>
    </div>
  </section>

  <section class="border-t border-line bg-bg-alt">
    <div class="page flex flex-wrap items-center justify-between gap-8 py-40 max-[860px]:py-24">
      <div>
        <p class="m-0 mb-3 text-[13px] text-subtle">{{ $t('caseStudy.next.comment') }}</p>
        <UiSectionTitle>{{ $t('caseStudy.next.title') }}</UiSectionTitle>
      </div>
      <div class="flex flex-wrap gap-3">
        <UiButton to="contact">{{ $t('common.contactMe') }}</UiButton>
        <UiButton to="projects" variant="secondary">{{ $t('common.allProjects') }}</UiButton>
      </div>
    </div>
  </section>
</template>
