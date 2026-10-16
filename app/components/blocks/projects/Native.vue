<!--
  The projects: featured (with the mockup) and the Home ones ("home"), only the featured
  ones ("featured"), or all the others as an archive ("archive").
-->
<script setup lang="ts">
import type {BlockProjects} from '~/types/content'

const props = defineProps<{
  block: BlockProjects
  /** The label with its number. */
  label?: string
}>()

const pageLink = usePageLink()
const projects = await usePublishedProjects()
const featured = computed(() => props.block.show === 'archive' ? [] : projects.value.filter(p => p.featured))
const cards = computed(() => props.block.show === 'home'
  ? projects.value.filter(p => p.on_home && !p.featured)
  : props.block.show === 'archive' ? projects.value.filter(p => !p.featured) : [])
</script>

<template>
  <section v-if="block.show === 'featured' && !block.title" class="border-t border-line">
    <div class="page pt-30">
      <p v-if="label" class="m-0 mb-10 text-[13px] text-accent">{{ label }}</p>
      <ProjectFeaturedGrid :projects="featured"/>
    </div>
  </section>

  <section v-else :class="block.show === 'home' && 'border-t border-line'">
    <div class="page section-y">
      <div v-if="label || block.title || block.all_link" class="mb-14 flex flex-wrap items-end justify-between gap-5">
        <div>
          <UiSectionLabel v-if="label">{{ label }}</UiSectionLabel>
          <UiSectionTitle v-if="block.title">{{ block.title }}</UiSectionTitle>
        </div>
        <NuxtLink v-if="block.all_link" :to="pageLink('projects')" class="border-b border-accent pb-1 text-sm text-ink hover:text-ink">
          {{ $t('common.allProjects') }} →
        </NuxtLink>
      </div>
      <ProjectFeaturedGrid v-if="featured.length" :projects="featured"/>
      <div
        v-if="cards.length"
        class="grid gap-6"
        :class="block.show === 'home' ? 'mt-6 grid-cols-[repeat(auto-fit,minmax(300px,1fr))]' : 'grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))]'"
      >
        <ProjectCard
          v-for="project in cards"
          :key="project.id"
          :project="project"
          :variant="block.show === 'home' ? 'compact' : 'archive'"
        />
      </div>
    </div>
  </section>
</template>
