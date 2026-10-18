<script setup lang="ts">
import type {BlockProjects} from '~/types/content'

const props = defineProps<{block: BlockProjects}>()

const projects = await usePublishedProjects()
const shown = computed(() => projects.value.filter(p => isOfKind(p, props.block.kind) && ({
  home: p.featured || p.on_home,
  featured: p.featured,
  archive: !p.featured,
  grouped: true,
})[props.block.show]))
const linkOf = useProjectLink()
</script>

<template>
  <BlocksLegacyHeading>{{ block.title ?? block.label }}</BlocksLegacyHeading>
  <template v-if="block.show === 'grouped'">
    <p v-for="group in groupByCategory(shown)" :key="group.category" class="m-0 mb-3">
      <b>{{ $t(`projects.category.${group.category}`) }}:</b>
      <template v-for="(project, i) in group.projects" :key="project.id">
        {{ ' ' }}<LegacyLink v-if="linkOf(project).href" :href="linkOf(project).href">{{ project.name }}</LegacyLink>
        <template v-else>{{ project.name }}</template>
        <i v-if="project.note"> ({{ project.note }})</i>{{ i < group.projects.length - 1 ? ',' : '.' }}
      </template>
    </p>
  </template>
  <component :is="block.show === 'archive' ? 'ol' : 'ul'" v-else class="m-0 pl-[26px]" :class="block.show === 'archive' ? 'list-decimal' : 'list-disc'">
    <li v-for="project in shown" :key="project.id" class="mb-1">
      <LegacyLink v-if="linkOf(project).href" :href="linkOf(project).href">{{ project.name }}</LegacyLink>
      <template v-else>{{ project.name }}</template>{{ ' ' }}
      <b v-if="project.case_study">[{{ $t('projects.caseStudy') }}]</b>
      <template v-else-if="project.url">[{{ $t('projects.external') }}]</template>
      <template v-if="project.note"> — <i>{{ project.note }}</i></template>
    </li>
  </component>
</template>
