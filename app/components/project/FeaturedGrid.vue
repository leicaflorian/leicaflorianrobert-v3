<!-- The featured projects: the first one wide (laptop), the second narrow (phone). -->
<script setup lang="ts">
import type {Project} from '~/types/content'

defineProps<{ projects: Project[] }>()
</script>

<template>
  <div class="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-6 max-[860px]:grid-cols-1">
    <ProjectFeatured v-for="project in projects" :key="project.id" :project="project"/>
  </div>
</template>
