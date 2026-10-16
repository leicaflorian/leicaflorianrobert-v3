<!--
  The years of the experiences on a line, one slot per year as on the old site: a node for
  the years with an experience, linking to it in the list below (most recent first, so to the
  last one of that year); a dot for the empty ones.
-->
<script setup lang="ts">
import type {Experience} from '~/types/content'

const props = defineProps<{experiences: Experience[]}>()

const slots = computed(() => {
  const years = props.experiences.flatMap(e => e.year ?? [])
  if (!years.length) return []
  const first = Math.min(...years)
  return Array.from({length: Math.max(...years) - first + 1}, (_, i) => {
    const year = first + i
    return {year, experiences: props.experiences.filter(e => e.year === year)}
  })
})
</script>

<template>
  <nav :aria-label="$t('about.timeline')" class="relative">
    <div class="absolute inset-x-0 top-[5px] h-px bg-line-control"/>
    <ol class="relative m-0 flex list-none p-0">
      <li v-for="{year, experiences: inYear} in slots" :key="year" class="flex flex-1 justify-center">
        <a
          v-if="inYear.length"
          :href="`#exp-${inYear.at(-1)!.id}`"
          class="group relative flex flex-col items-center gap-3 text-xs text-muted hover:text-accent"
        >
          <span class="spring size-3 rounded-full border-2 border-ink bg-bg group-hover:scale-150 group-hover:border-accent"/>
          {{ year }}
          <span class="pointer-events-none absolute bottom-full mb-3 whitespace-nowrap text-ink opacity-0 transition-opacity group-hover:opacity-100">
            {{ inYear.map(e => e.company).join(' · ') }}
          </span>
        </a>
        <span v-else class="mt-1 size-1 rounded-full bg-line-control"/>
      </li>
    </ol>
  </nav>
</template>
