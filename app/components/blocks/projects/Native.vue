<!--
  The projects: featured (with the mockup) and the Home ones ("home"), only the featured
  ones ("featured"), all the others as an archive ("archive"), or just their names by category
  ("grouped"). `kind` narrows them to client work or personal projects.
-->
<script setup lang="ts">
import type {BlockProjects} from '~/types/content'

const props = defineProps<{
  block: BlockProjects
  /** The label with its number. */
  label?: string
}>()

const pageLink = usePageLink()
const published = await usePublishedProjects()
const projects = computed(() => published.value.filter(p => isOfKind(p, props.block.kind)))
const featured = computed(() => props.block.show === 'archive' ? [] : projects.value.filter(p => p.featured))
const cards = computed(() => props.block.show === 'home'
  ? projects.value.filter(p => p.on_home && !p.featured)
  : props.block.show === 'archive' ? projects.value.filter(p => !p.featured) : [])
/** In Home, three or more cards make a bento: the first one large, the next two stacked beside it. */
const bento = computed(() => props.block.show === 'home' && cards.value.length >= 3)
const groups = computed(() => props.block.show === 'grouped' ? groupByCategory(projects.value) : [])
</script>

<template>
  <section v-if="block.show === 'featured' && !block.title" class="border-t border-line">
    <div class="page pt-30">
      <p v-if="label" class="m-0 mb-10 text-[13px] text-accent">{{ label }}</p>
      <ProjectFeaturedGrid v-reveal :projects="featured"/>
    </div>
  </section>

  <section v-else class="border-t border-line">
    <div class="page section-y">
      <div v-if="label || block.title || block.all_link" class="mb-14 flex flex-wrap items-end justify-between gap-5">
        <div>
          <UiSectionLabel v-if="label">{{ label }}</UiSectionLabel>
          <UiSectionTitle v-if="block.title">{{ block.title }}</UiSectionTitle>
        </div>
        <NuxtLink v-if="block.all_link" :to="pageLink('projects')" class="inline-flex items-center gap-2 border-b border-accent pb-1 text-sm text-ink hover:text-ink">
          {{ $t('common.allProjects') }}<UiArrowIcon/>
        </NuxtLink>
      </div>
      <ProjectFeaturedGrid v-if="featured.length" v-reveal :projects="featured"/>
      <div
        v-if="cards.length"
        v-reveal.stagger
        class="grid gap-6"
        :class="block.show !== 'home' ? 'grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))]' : bento ? 'mt-6 grid-cols-[2fr_1fr] max-[860px]:grid-cols-1' : 'mt-6 grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))]'"
      >
        <ProjectCard
          v-for="(project, i) in cards"
          :key="project.id"
          :project="project"
          :variant="block.show === 'home' ? 'compact' : 'archive'"
          :large="bento && i === 0"
          :class="bento && i === 0 && 'row-span-2 max-[860px]:row-auto'"
        />
      </div>
      <dl v-if="groups.length" v-reveal.stagger class="m-0 grid gap-8">
        <div
          v-for="group in groups"
          :key="group.category"
          class="grid grid-cols-[240px_1fr] gap-6 border-t border-line pt-7 max-[860px]:grid-cols-1 max-[860px]:gap-3"
        >
          <dt class="text-[13px] text-accent">{{ $t(`projects.category.${group.category}`) }}</dt>
          <dd class="m-0 flex flex-wrap gap-x-7 gap-y-3">
            <ProjectLink
              v-for="project in group.projects"
              :key="project.id"
              :project="project"
              class="inline-flex items-baseline gap-2 text-[15px] text-ink hover:text-accent"
            >
              <span>{{ project.name }}</span>
              <span v-if="project.note" class="text-[13px] text-muted">{{ project.note }}</span>
              <ProjectArrow :project="project" class="text-xs"/>
            </ProjectLink>
          </dd>
        </div>
      </dl>
    </div>
  </section>
</template>
