<script setup lang="ts">
import type {Experience, PageAbout, Site, Technology} from '~/types/content'

const {isNative} = useEngine()
const {t} = useI18n()

const [site, page, experiences, technologies] = await Promise.all([
  useSingleton<Site>('site'),
  useSingleton<PageAbout>('page_about'),
  useCollection<Experience>('experiences'),
  useCollection<Technology>('technologies'),
])

/** Years of experience are counted from the first experience that has a year. */
const years = computed(() => {
  const first = Math.min(...experiences.value.map(e => e.year ?? Infinity))
  return Number.isFinite(first) ? new Date().getFullYear() - first : 0
})

useSeoMeta({
  title: () => t('legacyNav.about'),
  description: () => page.value.intro,
})
</script>

<template>
  <AboutNative v-if="isNative" :page="page" :experiences="experiences" :technologies="technologies" :years="years"/>
  <AboutLegacy v-else :page="page" :experiences="experiences" :technologies="technologies" :years="years"/>
</template>
