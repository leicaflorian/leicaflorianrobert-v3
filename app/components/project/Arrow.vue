<!--
  Where a project leads: its case study, a page of this site (→ with a tag),
  or the external website, in a new tab (↗).
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
  <span v-else class="shrink-0 text-accent">↗</span>
</template>
