<script setup lang="ts">
import type {PageHome, Project, Service, Site} from '~/types/content'

const {isNative} = useEngine()

const [site, page, services, projects] = await Promise.all([
  useSingleton<Site>('site'),
  useSingleton<PageHome>('page_home'),
  useCollection<Service>('services'),
  useCollection<Project>('projects', {status: {_eq: 'published'}}),
])

const homeProjects = computed(() => projects.value.filter(p => p.featured || p.on_home))

useSeoMeta({
  title: () => `${page.value.hero_title} ${page.value.hero_title_accent}`,
  description: () => page.value.hero_text,
})
</script>

<template>
  <HomeNative v-if="isNative" :site="site" :page="page" :services="services" :projects="homeProjects"/>
  <HomeLegacy v-else :site="site" :page="page" :services="services" :projects="homeProjects"/>
</template>
