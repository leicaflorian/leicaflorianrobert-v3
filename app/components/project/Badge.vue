<!-- Projects with a case study stand out; the others get no badge. -->
<script setup lang="ts">
import type {Project} from '~/types/content'

defineProps<{project: Project}>()
</script>

<template>
  <span
    v-if="project.case_study"
    class="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 text-[11px] text-accent"
  >
    {{ $t('projects.caseStudy') }}<UiArrowIcon/>
  </span>
</template>
