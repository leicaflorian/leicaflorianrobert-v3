<!--
  Where a project leads: its case study, a page of this site (→ with a tag),
  or the external website, in a new tab (↗); nothing for a project without either.
-->
<script setup lang="ts">
import type {Project} from '~/types/content'

defineProps<{project: Project}>()
</script>

<template>
  <span v-if="project.case_study" class="inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-accent">
    <span class="text-[11px]">{{ $t('projects.caseStudy') }}</span>
    <span>→</span>
  </span>
  <span v-else-if="project.url" class="shrink-0 text-accent">↗</span>
</template>
