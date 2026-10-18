<!--
  A project's picture: its image or, when it has none or is marked `typographic`,
  a cover drawn in code from its name, type, year and logo, if any. Being text, the
  typographic cover follows the language, and it scales with its box (container query
  units), from a card to the case study header.
-->
<script setup lang="ts">
import type {FileId, Project} from '~/types/content'

const props = defineProps<{
  project: Project
  /** An image that wins over the project's own and over `typographic` (the case study cover). */
  image?: FileId
  /** Maximum width in pixels at which Directus returns the image. */
  width?: number
}>()
const {t} = useI18n()

const src = computed(() => props.image ?? (props.project.typographic ? null : props.project.image))
const kicker = computed(() => props.project.type ?? t(`projects.kind.${props.project.kind}`))
const footer = computed(() => [props.project.year, props.project.stack].filter(Boolean).join(' · ') || hostOf(props.project.url))
</script>

<template>
  <UiMediaImage v-if="src" :id="src" :alt="project.name" :width="width"/>
  <div
    v-else
    role="img"
    :aria-label="project.name"
    class="@container flex size-full flex-col justify-center overflow-hidden bg-[radial-gradient(circle_at_85%_110%,color-mix(in_srgb,var(--color-accent)_22%,transparent),transparent_55%),linear-gradient(160deg,var(--color-surface),var(--color-bg)_60%,var(--color-bg-deep))] px-[9%] font-mono"
  >
    <!-- client logos are made for white pages: a light plate keeps their dark parts readable -->
    <div v-if="project.logo" class="mb-[3.2cqw] self-start rounded-[1cqw] bg-ink px-[2.2cqw] py-[1.6cqw]">
      <NuxtImg :src="project.logo" alt="" :width="480" loading="lazy" class="block h-[max(18px,4.2cqw)] w-auto"/>
    </div>
    <p class="m-0 mb-[2.4cqw] truncate text-[max(10px,1.9cqw)] text-accent">// {{ kicker }}</p>
    <p class="m-0 text-[8cqw] font-extrabold leading-[1.02] tracking-[-0.03em] text-balance text-ink">
      {{ project.name }}<span aria-hidden="true" class="ml-[0.12em] inline-block h-[0.1em] w-[0.5em] bg-accent align-baseline"/>
    </p>
    <p v-if="footer" class="m-0 mt-[3cqw] truncate text-[max(10px,2.1cqw)] text-muted">{{ footer }}</p>
  </div>
</template>
