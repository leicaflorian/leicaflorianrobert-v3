<script setup lang="ts">
import type {PageCaseStudy} from '~/types/content'

defineProps<{ page: PageCaseStudy }>()

const {t} = useI18n()
const sections = computed(() => [
  t('caseStudy.start.title'),
  t('caseStudy.concept.title'),
  t('caseStudy.visual.title'),
  t('caseStudy.details.title'),
])
</script>

<template>
  <p class="m-0 mb-3"><LegacyLink to="projects">{{ $t('caseStudy.legacy.back') }}</LegacyLink></p>
  <h2 class="m-0 mb-3 text-[26px] font-bold">{{ $t('caseStudy.legacy.title', {name: page.title}) }}</h2>
  <p class="m-0 mb-3">{{ $t('caseStudy.legacy.facts', {role: page.role, year: page.year}) }}</p>
  <p class="m-0 mb-3">{{ page.intro }}</p>
  <p class="m-0 mb-3"><i>{{ $t('caseStudy.legacy.notice') }}</i></p>
  <ul class="m-0 list-disc pl-[22px]">
    <li v-for="section in sections" :key="section">{{ section }}</li>
  </ul>
</template>
