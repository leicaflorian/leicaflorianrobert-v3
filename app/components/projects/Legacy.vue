<script setup lang="ts">
import type {PageProjects, Project} from '~/types/content'

defineProps<{
  page: PageProjects
  projects: Project[]
}>()

const linkOf = useProjectLink()
</script>

<template>
  <h2 class="m-0 mb-3 text-[26px] font-bold">{{ $t('projects.title') }}</h2>
  <p v-for="(paragraph, i) in paragraphs(page.intro)" :key="i" class="m-0 mb-3">{{ paragraph }}</p>
  <h3 class="m-0 mb-2 mt-6 text-xl font-bold">{{ $t('projects.legacy.list') }}</h3>
  <ol class="m-0 list-decimal pl-[26px]">
    <li v-for="project in projects" :key="project.id" class="mb-1">
      <LegacyLink :href="linkOf(project).href">{{ project.name }}</LegacyLink>
      <template v-if="project.note"> — <i>{{ project.note }}</i></template>
    </li>
  </ol>
</template>
