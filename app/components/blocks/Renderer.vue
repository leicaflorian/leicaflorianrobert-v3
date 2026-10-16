<!--
  The sections of a page or case study: for each block, its native or legacy component.
  Labels are numbered in order ("servizi" → "01 / servizi"), except those starting with "//".
-->
<script setup lang="ts">
import type {Component} from 'vue'
import type {BlockCollection, Experience, Section, Service, Technology} from '~/types/content'
import {
  BlocksContactFormLegacy, BlocksContactFormNative, BlocksContactInfoLegacy, BlocksContactInfoNative,
  BlocksCtaLegacy, BlocksCtaNative, BlocksExperiencesLegacy, BlocksExperiencesNative,
  BlocksGalleryLegacy, BlocksGalleryNative, BlocksHeroHomeLegacy, BlocksHeroHomeNative,
  BlocksListLegacy, BlocksListNative, BlocksPageHeaderLegacy, BlocksPageHeaderNative,
  BlocksPaletteLegacy, BlocksPaletteNative, BlocksProjectsLegacy, BlocksProjectsNative,
  BlocksServicesLegacy, BlocksServicesNative, BlocksStackLegacy, BlocksStackNative,
  BlocksTextLegacy, BlocksTextNative,
} from '#components'

const props = defineProps<{sections: Section[]}>()

const {mode} = useEngine()

const COMPONENTS: Record<BlockCollection, {native: Component, legacy: Component}> = {
  block_hero_home: {native: BlocksHeroHomeNative, legacy: BlocksHeroHomeLegacy},
  block_page_header: {native: BlocksPageHeaderNative, legacy: BlocksPageHeaderLegacy},
  block_text: {native: BlocksTextNative, legacy: BlocksTextLegacy},
  block_gallery: {native: BlocksGalleryNative, legacy: BlocksGalleryLegacy},
  block_list: {native: BlocksListNative, legacy: BlocksListLegacy},
  block_palette: {native: BlocksPaletteNative, legacy: BlocksPaletteLegacy},
  block_cta: {native: BlocksCtaNative, legacy: BlocksCtaLegacy},
  block_contact_form: {native: BlocksContactFormNative, legacy: BlocksContactFormLegacy},
  block_services: {native: BlocksServicesNative, legacy: BlocksServicesLegacy},
  block_projects: {native: BlocksProjectsNative, legacy: BlocksProjectsLegacy},
  block_experiences: {native: BlocksExperiencesNative, legacy: BlocksExperiencesLegacy},
  block_stack: {native: BlocksStackNative, legacy: BlocksStackLegacy},
  block_contact_info: {native: BlocksContactInfoNative, legacy: BlocksContactInfoLegacy},
}

/**
 * The content some blocks read besides their own fields. The server renders only legacy blocks:
 * loading it here for every section puts it in the payload for the native ones too.
 */
const BLOCK_DATA: Partial<Record<BlockCollection, (section: Section) => Promise<unknown> | undefined>> = {
  block_services: () => useCollection<Service>('services'),
  block_projects: () => usePublishedProjects(),
  block_page_header: ({item}) => {
    if (!('variant' in item)) return
    if (item.variant === 'about') return useAboutStats()
    if (item.variant === 'projects') return usePublishedProjects()
  },
  block_experiences: () => useCollection<Experience>('experiences'),
  block_stack: () => useCollection<Technology>('technologies'),
}
// the composables share a cache key per collection: loading twice makes one request
await Promise.all(props.sections.map(section => BLOCK_DATA[section.collection]?.(section)))

/** The labels with their numbers, counted on the native page so they don't change with the mode. */
const labels = computed(() => {
  let n = 0
  return new Map(props.sections.map((section) => {
    const label = 'label' in section.item ? section.item.label : null
    if (!label || label.startsWith('//') || section.item.engines === 'legacy') return [section.id, label ?? undefined]
    return [section.id, `${String(++n).padStart(2, '0')} / ${label}`]
  }))
})

const visible = computed(() => props.sections.filter(s => s.item.engines === 'both' || s.item.engines === mode.value))
</script>

<template>
  <component
    :is="COMPONENTS[section.collection][mode]"
    v-for="section in visible"
    :key="`${section.collection}-${section.id}`"
    :block="section.item"
    v-bind="mode === 'native' ? {label: labels.get(section.id)} : {}"
  />
</template>
