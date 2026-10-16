<!--
  A project in the grid: "archive" with note and domain (Projects page),
  "compact" with the name only (Home).
-->
<script setup lang="ts">
import type {Project} from '~/types/content'

withDefaults(defineProps<{
  project: Project
  variant?: 'archive' | 'compact'
}>(), {variant: 'archive'})
</script>

<template>
  <ProjectLink
    :project="project"
    class="spring flex flex-col overflow-hidden rounded-2xl border border-line-card bg-surface text-ink hover:border-accent hover:text-ink"
    :class="variant === 'archive' ? 'hover:-translate-y-1.5' : 'hover:-translate-y-1'"
  >
    <div :class="variant === 'archive' ? 'h-[220px] shrink-0' : 'aspect-video'">
      <UiMediaImage :id="project.image" :alt="project.name" :width="720"/>
    </div>

    <div v-if="variant === 'archive'" class="flex flex-1 flex-col gap-2 px-7 py-6">
      <div class="flex items-center justify-between gap-3">
        <h3 class="m-0 text-[17px] font-bold">{{ project.name }}</h3>
        <span class="text-accent">↗</span>
      </div>
      <p v-if="project.note" class="m-0 text-[13px] text-muted">{{ project.note }}</p>
      <div class="mt-auto flex items-center justify-between gap-3 pt-2">
        <p class="m-0 truncate text-xs text-dim">
          {{ project.case_study ? $t('projects.caseStudy') : hostOf(project.url) }}
        </p>
        <ProjectBadge :kind="project.kind"/>
      </div>
    </div>

    <div v-else class="flex items-center justify-between gap-3 px-7 py-[22px]">
      <h3 class="m-0 text-[17px] font-bold">{{ project.name }}</h3>
      <div class="flex items-center gap-3">
        <ProjectBadge :kind="project.kind"/>
        <span class="text-accent">↗</span>
      </div>
    </div>
  </ProjectLink>
</template>
