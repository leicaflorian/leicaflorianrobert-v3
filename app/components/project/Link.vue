<!-- A project card's link: NuxtLink for the case study, <a> for external websites. -->
<script setup lang="ts">
import type {Project} from '~/types/content'

const props = defineProps<{ project: Project }>()
const linkOf = useProjectLink()
const link = computed(() => linkOf(props.project))
</script>

<template>
  <NuxtLink v-if="link.internal" :to="link.href">
    <slot/>
  </NuxtLink>
  <a v-else :href="link.href" :target="link.target" :rel="link.rel">
    <slot/>
  </a>
</template>
