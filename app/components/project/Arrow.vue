<!--
  Where a project leads: its case study, a page of this site (→ with a tag; nothing when
  `badged`, since `ProjectBadge` already says it), or the external website, in a new tab (↗);
  nothing for a project without either.
-->
<script setup lang="ts">
import type {Project} from '~/types/content'

withDefaults(defineProps<{project: Project, badged?: boolean}>(), {badged: false})
</script>

<template>
  <template v-if="project.case_study">
    <span v-if="!badged" class="inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-accent">
      <span class="text-[11px]">{{ $t('projects.caseStudy') }}</span>
      <span>→</span>
    </span>
  </template>
  <span v-else-if="project.url" class="shrink-0 text-accent">↗</span>
</template>
