<!--
  A project in the grid: "archive" with note and domain (Projects page),
  "compact" with name and note, the result in one line (Home). `large` is the Home's first
  card in the bento: its cover fills the height of the two beside it.
-->
<script setup lang="ts">
import type {Project} from '~/types/content'

withDefaults(defineProps<{
  project: Project
  variant?: 'archive' | 'compact'
  large?: boolean
}>(), {variant: 'archive'})
</script>

<template>
  <ProjectLink
    :project="project"
    class="spring flex flex-col overflow-hidden rounded-2xl border border-line-card bg-surface text-ink hover:border-accent hover:text-ink"
    :class="variant === 'archive' ? 'hover:-translate-y-1.5' : 'hover:-translate-y-1'"
  >
    <div :class="variant === 'archive' ? 'h-[220px] shrink-0' : large ? 'min-h-0 flex-1 max-[860px]:aspect-video max-[860px]:flex-none' : 'aspect-video'">
      <ProjectCover :project="project" :width="large ? 1240 : 720"/>
    </div>

    <div v-if="variant === 'archive'" class="flex flex-1 flex-col gap-2 px-7 py-6">
      <div class="flex items-center justify-between gap-3">
        <h3 class="m-0 text-[17px] font-bold">{{ project.name }}</h3>
        <ProjectArrow :project="project" badged/>
      </div>
      <p v-if="project.note" class="m-0 text-[13px] text-muted">{{ project.note }}</p>
      <div class="mt-auto flex items-center justify-between gap-3 pt-2">
        <p class="m-0 truncate text-xs text-dim">
          {{ hostOf(project.url) }}
        </p>
        <ProjectBadge :project="project"/>
      </div>
    </div>

    <!-- the name wraps if it must; where it leads stays on the right -->
    <div v-else class="flex flex-col gap-2" :class="large ? 'px-8 py-[26px]' : 'px-7 py-[22px]'">
      <div class="flex items-baseline justify-between gap-3">
        <h3 class="m-0 min-w-0 font-bold" :class="large ? 'text-[22px]' : 'text-[17px]'">{{ project.name }}</h3>
        <ProjectArrow :project="project"/>
      </div>
      <p v-if="project.note" class="m-0 text-[13px] leading-normal text-muted">{{ project.note }}</p>
    </div>
  </ProjectLink>
</template>
