<!--
  A project's picture, drawn in code: type, name and year · stack at the top and, when the
  project has a screenshot (and isn't marked `typographic`), the screenshot below in a
  browser window cut by the bottom edge, with the logo over its bottom left corner.
  Without a screenshot the text is centred, with the logo above it. Being text, the cover
  follows the language, and it scales with its box (container query units; the box always
  has its own size), from a card, where year and stack are left out, to the case study
  header. A device mockup (`bare`) or a case study `cover` gets the image alone.
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
    class="relative flex size-full flex-col justify-center overflow-hidden bg-[radial-gradient(circle_at_85%_110%,color-mix(in_srgb,var(--color-accent)_22%,transparent),transparent_55%),linear-gradient(160deg,var(--color-surface),var(--color-bg)_60%,var(--color-bg-deep))] px-[9%] font-mono [container-type:size]"
  >
    <!-- with a screenshot, centred on the window's left edge; dark logos made for white pages get a white plate -->
    <div
      v-if="project.logo"
      class="z-1 drop-shadow-[0_1.2cqw_2.4cqw_rgb(0_0_0/0.55)]"
      :class="[
        shot ? 'absolute bottom-[7cqh] left-[14%] -translate-x-1/2' : 'mb-[3.2cqw] self-start',
        project.logo_plate && 'rounded-[max(6px,1cqw)] bg-plate px-[max(9px,2cqw)] py-[max(6px,1.4cqw)]',
      ]"
    >
      <NuxtImg
        :src="project.logo"
        alt=""
        :width="480"
        loading="lazy"
        class="block"
        :class="project.logo_plate ? 'h-auto max-h-[max(28px,6cqw)] w-auto max-w-[max(110px,22cqw)]' : 'h-auto w-[max(46px,9cqw)]'"
      />
    </div>

    <!-- the box can't measure itself: with a screenshot the text is placed at the top here -->
    <div :class="shot && 'absolute inset-x-[9%] top-[9%]'">
      <p class="m-0 truncate text-accent" :class="shot ? 'mb-[1.6cqw] text-[max(9px,1.7cqw)]' : 'mb-[2.4cqw] text-[max(10px,1.9cqw)]'">// {{ kicker }}</p>
      <p class="m-0 font-extrabold leading-[1.02] tracking-[-0.03em] text-balance text-ink" :class="shot ? 'text-[6.4cqw]' : 'text-[8cqw]'">
        {{ project.name }}<span aria-hidden="true" class="ml-[0.12em] inline-block h-[0.1em] w-[0.5em] bg-accent align-baseline"/>
      </p>
      <p
        v-if="footer"
        class="m-0 truncate text-muted @max-[600px]:hidden"
        :class="shot ? 'mt-[1.8cqw] text-[max(9px,1.8cqw)]' : 'mt-[3cqw] text-[max(10px,2.1cqw)]'"
      >
        {{ footer }}
      </p>
    </div>

    <!-- in cards, without year and stack, the window moves up to keep the same gap -->
    <div v-if="shot" class="absolute inset-x-[14%] top-[47%] overflow-hidden rounded-t-[1.4cqw] border border-b-0 border-line-control bg-bg-deep shadow-[0_-2cqw_6cqw_rgb(0_0_0/0.45)] @max-[600px]:top-[40%]">
      <div class="flex h-[max(12px,3.4cqw)] items-center gap-[0.7cqw] border-b border-line-control bg-surface-raised px-[1.4cqw]">
        <span v-for="dot in 3" :key="dot" class="size-[max(4px,1cqw)] shrink-0 rounded-full bg-gutter"/>
        <span v-if="project.url" class="ml-[1.2cqw] max-w-1/2 truncate rounded-full bg-bg px-[1cqw] text-[max(6px,1.1cqw)] leading-[max(8px,2cqw)] text-dim">{{ hostOf(project.url) }}</span>
      </div>
      <NuxtImg :src="shot" alt="" :width="width" loading="lazy" class="block h-auto w-full"/>
    </div>
  </div>
</template>
