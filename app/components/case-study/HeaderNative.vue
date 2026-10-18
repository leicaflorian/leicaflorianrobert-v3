<!-- The top of a case study: title, intro, the project's facts and the cover. -->
<script setup lang="ts">
import type {CaseStudy} from '~/types/content'

const props = defineProps<{project: CaseStudy}>()
const {t} = useI18n()
const pageLink = usePageLink()

const facts = computed(() => [
  {label: t('caseStudy.facts.role'), value: props.project.role},
  {label: t('caseStudy.facts.year'), value: props.project.year},
  {label: t('caseStudy.facts.type'), value: props.project.type},
  {label: t('caseStudy.facts.stack'), value: props.project.stack},
].filter(fact => fact.value))
</script>

<template>
  <section>
    <div class="page pb-18 pt-24">
      <NuxtLink :to="pageLink('projects')" class="inline-flex text-[13px] text-subtle hover:text-accent">{{ $t('caseStudy.back') }}</NuxtLink>
      <p class="m-0 mb-4 mt-12 text-[13px] text-accent">{{ $t('caseStudy.comment') }}</p>
      <UiPageTitle>{{ project.name }}</UiPageTitle>
      <p v-if="project.intro" v-reveal class="m-0 mt-8 max-w-[640px] text-[17px] leading-[1.8] text-muted">{{ project.intro }}</p>
      <div v-if="facts.length || project.url" v-reveal class="mt-14 grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-px overflow-hidden rounded-[14px] border border-line-card bg-line-card">
        <div v-for="fact in facts" :key="fact.label" class="bg-surface px-6 py-5">
          <p class="m-0 mb-1.5 text-xs text-dim">{{ fact.label }}</p>
          <p class="m-0 text-sm">{{ fact.value }}</p>
        </div>
        <div v-if="project.url" class="bg-surface px-6 py-5">
          <p class="m-0 mb-1.5 text-xs text-dim">{{ $t('caseStudy.facts.link') }}</p>
          <a :href="project.url" target="_blank" rel="noopener" class="break-all text-sm text-ink hover:text-accent">{{ hostOf(project.url) }} ↗</a>
        </div>
      </div>
    </div>
    <div class="page pb-40">
      <div v-reveal class="aspect-video overflow-hidden rounded-2xl">
        <ProjectCover :project="project" :image="project.cover" :width="1600"/>
      </div>
    </div>
  </section>
</template>
