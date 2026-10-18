<!--
  The Home hero: title and buttons on the left; on the right the cut-out photo with
  the orange glow and the code snippet, which move with the mouse (parallax).
-->
<script setup lang="ts">
import type {BlockHeroHome, Site} from '~/types/content'

defineProps<{block: BlockHeroHome}>()

const site = await useSingleton<Site>('site')

const photo = useTemplateRef<HTMLElement>('photo')
const glow = useTemplateRef<HTMLElement>('glow')
const snippet = useTemplateRef<HTMLElement>('snippet')

/** How many pixels each layer moves, horizontally and vertically, with the mouse at the edge. */
const LAYERS = [
  [photo, 14, 10],
  [glow, -40, -30],
  [snippet, 30, 24],
] as const

function onMove(event: MouseEvent) {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const x = (event.clientX - rect.left) / rect.width - 0.5
  const y = (event.clientY - rect.top) / rect.height - 0.5
  for (const [el, dx, dy] of LAYERS) {
    if (el.value) el.value.style.transform = `translate(${x * dx}px, ${y * dy}px)`
  }
}

function onLeave() {
  for (const [el] of LAYERS) {
    if (el.value) el.value.style.transform = ''
  }
}
</script>

<template>
  <section class="relative overflow-hidden" @mousemove="onMove" @mouseleave="onLeave">
    <div class="page grid grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-end gap-12 pt-14 max-[860px]:grid-cols-1">
      <div class="self-center pb-28 pt-14 max-[860px]:pb-0">
        <UiAvailableBadge v-if="site.available"/>
        <p class="m-0 mb-4 mt-10 text-sm text-subtle">{{ $t('home.comment', {name: site.name, role: site.role}) }}</p>
        <UiPageTitle size="lg">
          {{ block.title }} <span class="text-accent">{{ block.title_accent }}</span>
        </UiPageTitle>
        <p v-reveal class="m-0 mt-8 max-w-[480px] text-[15px] leading-[1.8] text-muted">{{ block.text }}</p>
        <div v-reveal class="mt-11 flex flex-wrap gap-3">
          <UiButton to="contact" glow>{{ $t('common.contactMe') }}</UiButton>
          <UiButton to="projects" variant="secondary">{{ $t('home.seeProjects') }}</UiButton>
        </div>
      </div>

      <div class="relative flex min-h-[420px] items-end justify-center self-stretch max-[860px]:min-h-0">
        <div
          ref="glow"
          class="absolute inset-[8%_0_-4%_0] rounded-full bg-accent opacity-[0.28] blur-[100px] transition-transform duration-600 ease-spring"
        />
        <div
          ref="photo"
          class="absolute inset-[24px_0_0_0] flex items-end justify-center transition-transform duration-600 ease-spring max-[860px]:relative max-[860px]:inset-auto max-[860px]:w-full"
        >
          <img
            src="/imgs/me-transparent-dark.webp"
            :alt="site.name"
            class="block h-full w-auto max-w-none object-contain align-bottom mask-[linear-gradient(to_bottom,#000_88%,transparent)] max-[860px]:h-auto max-[860px]:w-full max-[860px]:max-w-[420px]"
          >
        </div>
        <div
          ref="snippet"
          aria-hidden="true"
          class="absolute bottom-6 -left-12 rounded-xl border border-line-control bg-surface/85 px-4 py-3.5 text-xs leading-[1.7] text-ink-soft shadow-[0_20px_50px_rgb(0_0_0/0.5)] backdrop-blur-md transition-transform duration-600 ease-spring max-[860px]:left-0"
        >
          <div class="animate-float">
            <span class="text-accent">engine</span>.render({<br>
            &nbsp;&nbsp;backend: <span class="text-code-string">"wgpu"</span>,<br>
            &nbsp;&nbsp;fps: <span class="text-code-number">120</span><br>
            })
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
