<!--
  A project's picture, drawn in code from its name, type, year and logo, if any; when the
  project has a screenshot (and isn't marked `typographic`), the text moves to the left
  and the screenshot sits on the right in a browser window, shown whole. Being text, the
  cover follows the language, and it scales with its box (container query units; the box
  always has its own size), from a card to the case study header. A device mockup
  (`bare`) or a case study `cover` gets the image alone.
-->
<script setup lang="ts">
import type {FileId, Project} from '~/types/content'

const props = defineProps<{
  project: Project
  /** An image that wins over everything else, shown alone (the case study cover). */
  image?: FileId
  /** Just the screenshot, for a box that already draws a device around it. */
  bare?: boolean
  /** Maximum width in pixels at which Directus returns the image. */
  width?: number
}>()
const {t} = useI18n()

const shot = computed(() => props.project.typographic ? null : props.project.image)
const src = computed(() => props.image ?? (props.bare ? shot.value : null))
const kicker = computed(() => props.project.type ?? t(`projects.kind.${props.project.kind}`))
const footer = computed(() => [props.project.year, props.project.stack].filter(Boolean).join(' · ') || hostOf(props.project.url))
</script>

<template>
  <UiMediaImage v-if="src" :id="src" :alt="project.name" :width="width"/>
  <div
    v-else
    role="img"
    :aria-label="project.name"
    class="relative flex size-full [container-type:size] flex-col justify-center overflow-hidden bg-[radial-gradient(circle_at_85%_110%,color-mix(in_srgb,var(--color-accent)_22%,transparent),transparent_55%),linear-gradient(160deg,var(--color-surface),var(--color-bg)_60%,var(--color-bg-deep))] px-[9%] font-mono"
  >
    <div class="flex flex-col" :class="shot && 'max-w-[41%]'">
      <!-- client logos are made for white pages: a light plate keeps their dark parts readable -->
      <div v-if="project.logo" class="mb-[3.2cqw] self-start rounded-[1cqw] bg-ink px-[2.2cqw] py-[1.6cqw]">
        <NuxtImg :src="project.logo" alt="" :width="480" loading="lazy" class="block h-[max(18px,4.2cqw)] w-auto"/>
      </div>
      <p class="m-0 mb-[2.4cqw] text-[max(10px,1.9cqw)] text-accent" :class="!shot && 'truncate'">// {{ kicker }}</p>
      <p class="m-0 font-extrabold leading-[1.02] tracking-[-0.03em] text-balance text-ink" :class="shot ? 'text-[5.4cqw]' : 'text-[8cqw]'">
        {{ project.name }}<span aria-hidden="true" class="ml-[0.12em] inline-block h-[0.1em] w-[0.5em] bg-accent align-baseline"/>
      </p>
      <p v-if="footer" class="m-0 mt-[3cqw] text-[max(10px,2.1cqw)] text-muted" :class="!shot && 'truncate'">{{ footer }}</p>
    </div>

    <!-- shrinks to the screenshot, so a site of any shape is shown whole -->
    <div v-if="shot" class="absolute right-[6%] top-1/2 -translate-y-1/2 overflow-hidden rounded-[1.2cqw] border border-line-control bg-bg-deep shadow-[0_2cqw_6cqw_rgb(0_0_0/0.45)]">
      <div class="flex h-[max(12px,3.4cqw)] items-center gap-[0.7cqw] border-b border-line-control bg-surface-raised px-[1.4cqw]">
        <span v-for="dot in 3" :key="dot" class="size-[max(4px,1cqw)] shrink-0 rounded-full bg-gutter"/>
        <span v-if="project.url" class="ml-[1cqw] truncate rounded-full bg-bg px-[1cqw] text-[max(6px,1.1cqw)] leading-[max(8px,2cqw)] text-dim">{{ hostOf(project.url) }}</span>
      </div>
      <NuxtImg :src="shot" alt="" :width="width" loading="lazy" class="block h-auto max-h-[calc(84cqh-max(12px,3.4cqw))] w-auto max-w-[48cqw]"/>
    </div>
  </div>
</template>
