<script setup lang="ts">
import type {PageProjects, Project} from '~/types/content'

const {isNative} = useEngine()
const {t} = useI18n()

const [page, projects] = await Promise.all([
  useSingleton<PageProjects>('page_projects'),
  useCollection<Project>('projects', {status: {_eq: 'published'}}),
])

useSeoMeta({
  title: () => t('projects.title'),
  description: () => paragraphs(page.value.intro)[0],
})
</script>

<template>
  <ProjectsNative v-if="isNative" :page="page" :projects="projects"/>
  <ProjectsLegacy v-else :page="page" :projects="projects"/>
</template>
