<script setup lang="ts">
import type {PageProjects, Project} from '~/types/content'

const props = defineProps<{
  page: PageProjects
  projects: Project[]
}>()

const featured = computed(() => props.projects.filter(p => p.featured))
const archive = computed(() => props.projects.filter(p => !p.featured))
</script>

<template>
  <section>
    <div class="page grid grid-cols-2 items-end gap-18 pb-30 pt-28 max-[860px]:grid-cols-1">
      <div>
        <UiSectionLabel>{{ $t('projects.count', {n: projects.length}) }}</UiSectionLabel>
        <UiPageTitle>{{ $t('projects.title') }}</UiPageTitle>
      </div>
      <div class="flex flex-col gap-4 text-[15px] leading-[1.8] text-muted">
        <p v-for="(paragraph, i) in paragraphs(page.intro)" :key="i" class="m-0">{{ paragraph }}</p>
      </div>
    </div>
  </section>

  <section v-if="featured.length" class="border-t border-line">
    <div class="page pt-30">
      <p class="m-0 mb-10 text-[13px] text-accent">{{ $t('projects.featured') }}</p>
      <ProjectFeaturedGrid :projects="featured"/>
    </div>
  </section>

  <section>
    <div class="page section-y">
      <div class="mb-14">
        <UiSectionLabel>{{ $t('projects.archive.label') }}</UiSectionLabel>
        <UiSectionTitle>{{ $t('projects.archive.title') }}</UiSectionTitle>
      </div>
      <div class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))] gap-6">
        <ProjectCard v-for="project in archive" :key="project.id" :project="project"/>
      </div>
    </div>
  </section>

  <SiteCtaBanner :text="page.cta_text"/>
</template>
