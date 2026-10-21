<script setup lang="ts">
import type {CaseStudy} from '~/types/content'

const props = defineProps<{project: CaseStudy}>()
const pageLink = usePageLink()
const awardLink = useAwardLink(() => props.project)
</script>

<template>
  <p class="m-0 mb-3"><LegacyLink :href="pageLink('projects')">{{ $t('caseStudy.legacy.back') }}</LegacyLink></p>
  <h2 class="m-0 mb-3 text-[26px] font-bold">{{ $t('caseStudy.legacy.title', {name: project.name}) }}</h2>
  <p v-if="project.role || project.year" class="m-0 mb-3">{{ $t('caseStudy.legacy.facts', {role: project.role, year: project.year}) }}</p>
  <p v-if="project.url" class="m-0 mb-3">{{ $t('caseStudy.legacy.link') }} <LegacyLink :href="project.url">{{ hostOf(project.url) }}</LegacyLink></p>
  <p v-if="project.award" class="m-0 mb-3">
    <i18n-t keypath="caseStudy.legacy.award" scope="global">
      <template #award><LegacyLink v-if="awardLink" :href="awardLink">{{ project.award }}</LegacyLink><template v-else>{{ project.award }}</template></template>
    </i18n-t>
  </p>
  <p v-if="project.intro" class="m-0 mb-3">{{ project.intro }}</p>
  <p class="m-0 mb-3"><i>{{ $t('caseStudy.legacy.notice') }}</i></p>
</template>
