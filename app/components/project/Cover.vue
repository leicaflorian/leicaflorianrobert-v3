<!--
  A project's picture, drawn in code. When the project has a screenshot (and isn't marked
  `typographic`) or an illustration (`visual`, for a project that can't be shown): the type at
  the top and right under it a browser window with it, cut by the bottom edge, with the logo in
  a tile over its bottom left corner (or, for the illustration, its phone over the bottom right);
  the name is left out, being in the card and on the case study page. Without either: type,
  name and year · stack, centred, with the logo above them. Being text, the cover
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
/** What fills the browser window: the illustration wins, being there for a project that can't be shown. */
const windowed = computed(() => Boolean(props.project.visual || shot.value))
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
    class="relative flex size-full flex-col overflow-hidden bg-[radial-gradient(circle_at_85%_110%,color-mix(in_srgb,var(--color-accent)_22%,transparent),transparent_55%),linear-gradient(160deg,var(--color-surface),var(--color-bg)_60%,var(--color-bg-deep))] px-[9%] font-mono [container-type:size]"
    :class="!windowed && 'justify-center'"
  >
    <!-- over the screenshot: a rounded tile of the same height for every logo, as wide as the logo up to a
         limit (square icons stay square), filled by it (logo files are cropped to their drawing), centred on
         the window's left edge, its light border keeping dark logos off the dark background. Dark logos made
         for white pages get a white tile, with a small margin so wide wordmarks don't touch its corners.
         A wide tile moves left by 12cqw at most, so in a card it doesn't leave the cover -->
    <div
      v-if="project.logo && shot && !project.visual"
      class="absolute bottom-[7cqh] left-[14%] z-1 flex h-[max(46px,9cqw)] min-w-[max(46px,9cqw)] max-w-[max(130px,26cqw)] translate-x-[calc(-1*min(50%,12cqw))] items-center justify-center overflow-hidden rounded-[max(10px,2cqw)] border border-line-tile drop-shadow-[0_1.2cqw_2.4cqw_rgb(0_0_0/0.55)]"
      :class="project.logo_plate ? 'bg-plate p-[max(5px,1cqw)]' : 'bg-surface-raised'"
    >
      <NuxtImg :src="project.logo" alt="" :width="480" loading="lazy" class="block h-full w-auto max-w-full object-contain"/>
    </div>
    <div
      v-else-if="project.logo && !windowed"
      class="mb-[3.2cqw] self-start"
      :class="project.logo_plate && 'rounded-[max(6px,1cqw)] bg-plate px-[max(9px,2cqw)] py-[max(6px,1.4cqw)]'"
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

    <ProjectVisualBankingPhone v-if="project.visual === 'banking'" class="absolute bottom-[-6cqh] right-[9%] z-1"/>

    <!-- with a window, only the type: name, year and stack are already in the card and on the case study
         page. The box can't measure itself, so the top margin is on this text, in its units: as wide as the
         space left of the window (14%), 56px at most, so large covers don't open a gap -->
    <p v-if="windowed" class="m-0 flex-none truncate pt-[min(14cqw,56px)] text-[max(9px,1.7cqw)] text-accent">// {{ kicker }}</p>
    <div v-else>
      <p class="m-0 mb-[2.4cqw] truncate text-[max(10px,1.9cqw)] text-accent">// {{ kicker }}</p>
      <p class="m-0 text-[8cqw] font-extrabold leading-[1.02] tracking-[-0.03em] text-balance text-ink">
        {{ project.name }}<span aria-hidden="true" class="ml-[0.12em] inline-block h-[0.1em] w-[0.5em] bg-accent align-baseline"/>
      </p>
      <p v-if="footer" class="m-0 mt-[3cqw] truncate text-[max(10px,2.1cqw)] text-muted @max-[600px]:hidden">{{ footer }}</p>
    </div>

    <!-- right under the type, cut by the cover's bottom edge; a screenshot shorter than the space left (a wide
         one in the big cover) is stretched to the edge, anchored at the top left (a site's logo and headline), so the window never floats -->
    <div v-if="windowed" class="mx-[6%] mt-[calc(2.4cqw+8px)] flex shrink-0 grow flex-col overflow-hidden rounded-t-[1.4cqw] border border-b-0 border-line-control bg-bg-deep shadow-[0_-2cqw_6cqw_rgb(0_0_0/0.45)]">
      <div class="flex h-[max(12px,3.4cqw)] items-center gap-[0.7cqw] border-b border-line-control bg-surface-raised px-[1.4cqw]">
        <span v-for="dot in 3" :key="dot" class="size-[max(4px,1cqw)] shrink-0 rounded-full bg-gutter"/>
        <span v-if="project.url && !project.visual" class="ml-[1.2cqw] max-w-1/2 truncate rounded-full bg-bg px-[1cqw] text-[max(6px,1.1cqw)] leading-[max(8px,2cqw)] text-dim">{{ hostOf(project.url) }}</span>
      </div>
      <ProjectVisualBankingScreen v-if="project.visual === 'banking'"/>
      <NuxtImg v-else-if="shot" :src="shot" alt="" :width="width" loading="lazy" class="block h-auto w-full grow object-cover object-left-top"/>
    </div>
  </div>
</template>
