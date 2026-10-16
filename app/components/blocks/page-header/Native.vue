<!--
  The top of a page: label, large title and intro. The variants add the ASCII portrait and
  the numbers (About), the number of projects and their git graph (Projects), availability,
  email and the ASCII map (Contact).
-->
<script setup lang="ts">
import type {BlockPageHeader, Site} from '~/types/content'
import {pin as mapPin} from '~/assets/ascii-map.json'

const props = defineProps<{block: BlockPageHeader}>()

const site = await useSingleton<Site>('site')
const stats = props.block.variant === 'about' ? await useAboutStats() : null
const projects = props.block.variant === 'projects' ? await usePublishedProjects() : null

const label = computed(() => props.block.label?.replace('{n}', String(projects?.value.length ?? 0)))

/** The Contact map's pin, as the status line shows it. */
const coordinates = `${mapPin.lat.toFixed(2)}°N ${mapPin.lon.toFixed(2)}°E`
const place = computed(() => `${site.value.city} (${site.value.province})`)
const workStatus = props.block.variant === 'contact' ? useWorkStatus() : null
</script>

<template>
  <section v-if="block.variant === 'about'">
    <div class="page grid grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] items-center gap-18 pb-30 pt-28 max-[860px]:grid-cols-1">
      <div>
        <UiSectionLabel v-if="label">{{ label }}</UiSectionLabel>
        <UiPageTitle size="lg">{{ block.title }}</UiPageTitle>
        <p class="m-0 mt-8 max-w-[520px] text-[15px] leading-[1.8] text-muted">{{ block.intro }}</p>
        <div v-if="stats" class="mt-12 flex flex-wrap gap-12">
          <div>
            <p class="m-0 text-[56px] font-extrabold leading-none tracking-[-0.04em] text-accent">{{ stats.years }}</p>
            <p class="m-0 mt-2.5 text-xs text-subtle">{{ $t('about.years') }}</p>
          </div>
          <div>
            <p class="m-0 text-[56px] font-extrabold leading-none tracking-[-0.04em] text-ink">{{ stats.technologies }}</p>
            <p class="m-0 mt-2.5 text-xs text-subtle">{{ $t('about.tech') }}</p>
          </div>
        </div>
      </div>
      <div class="relative">
        <div class="absolute inset-[20%_10%_10%_10%] rounded-full bg-accent opacity-[0.14] blur-[110px]"/>
        <div class="relative overflow-hidden rounded-2xl border border-line-card bg-bg-deep/92">
          <div class="flex items-center gap-1.5 border-b border-line bg-surface px-4 py-3 text-xs text-subtle">
            <span v-for="i in 3" :key="i" class="size-[9px] shrink-0 rounded-full bg-gutter"/>
            <span class="ml-2 truncate"><span class="text-code-ok">$</span> cat leica.webp | ascii --cols 84</span>
          </div>
          <div class="cursor-crosshair px-4 pt-5">
            <UiAsciiPortrait src="/imgs/me-transparent-dark.webp" :label="site.name"/>
          </div>
          <div class="flex justify-between gap-3 border-t border-line px-4 py-3 text-[11px] text-ghost">
            <span>leica.webp · 1600×2008</span>
            <span>{{ $t('about.hover') }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section v-else-if="block.variant === 'projects' && projects">
    <div class="page grid grid-cols-2 items-center gap-18 pb-30 pt-28 max-[860px]:grid-cols-1">
      <div>
        <UiSectionLabel v-if="label">{{ label }}</UiSectionLabel>
        <UiPageTitle>{{ block.title }}</UiPageTitle>
        <div class="mt-8 flex flex-col gap-4 text-[15px] leading-[1.8] text-muted">
          <p v-for="(paragraph, i) in paragraphs(block.intro)" :key="i" class="m-0">{{ paragraph }}</p>
        </div>
      </div>
      <ProjectGraph :projects="projects"/>
    </div>
  </section>

  <section v-else-if="block.variant === 'contact'">
    <div class="page grid grid-cols-2 items-center gap-18 pb-30 pt-28 max-[860px]:grid-cols-1">
      <div>
        <UiAvailableBadge v-if="site.available"/>
        <UiPageTitle class="mt-8">{{ block.title }}</UiPageTitle>
        <div class="mt-8 flex flex-col gap-4 text-[15px] leading-[1.8] text-muted">
          <p v-for="(paragraph, i) in paragraphs(block.intro)" :key="i" class="m-0">{{ paragraph }}</p>
        </div>
        <a
          :href="`mailto:${site.email}`"
          class="mt-5 inline-block break-all border-b-2 border-accent pb-1.5 text-[clamp(16px,2vw,22px)] font-bold text-ink hover:text-accent"
        >{{ site.email }} ↗</a>
      </div>
      <div class="min-w-0 overflow-hidden rounded-2xl border border-line-card bg-bg-deep">
        <div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 border-b border-line bg-surface px-4 py-3 text-xs text-subtle">
          <span class="flex min-w-0 items-center gap-1.5">
            <span v-for="i in 3" :key="i" class="size-[9px] shrink-0 rounded-full bg-gutter"/>
            <span class="ml-2 truncate"><span class="text-code-ok">$</span> whereis leica</span>
          </span>
          <span v-if="workStatus === 'online'" class="shrink-0 text-accent">● {{ $t('contact.map.online') }}</span>
          <span v-else-if="workStatus" class="shrink-0 truncate text-subtle">○ {{ $t('contact.map.offline') }} · {{ $t(`contact.map.reply.${workStatus}`) }}</span>
        </div>
        <div class="px-4 py-5">
          <UiAsciiMap :label="$t('contact.map.label', {place})"/>
        </div>
        <!-- the gap shows the line colour behind: borders between cells in any number of columns -->
        <div class="grid grid-cols-4 gap-px border-t border-line bg-line text-[11px] max-[860px]:grid-cols-2">
          <div class="flex flex-col gap-0.5 bg-bg-deep px-4 py-3">
            <span class="text-ghost">{{ place }}</span>
            <span class="text-ink">{{ coordinates }}</span>
          </div>
          <div class="flex flex-col gap-0.5 bg-bg-deep px-4 py-3">
            <span class="text-ghost">{{ $t('contact.map.zone') }}</span>
            <span class="text-ink">Europe/Rome</span>
          </div>
          <div class="flex flex-col gap-0.5 bg-bg-deep px-4 py-3">
            <span class="text-ghost">{{ $t('contact.map.radius') }}</span>
            <span class="text-ink">{{ $t('contact.map.remote') }}</span>
          </div>
          <div class="flex flex-col gap-0.5 bg-bg-deep px-4 py-3">
            <span class="text-ghost">{{ $t('contact.map.languages') }}</span>
            <span class="text-ink">it · en · ro</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section v-else>
    <div class="page grid grid-cols-2 items-end gap-18 pb-30 pt-28 max-[860px]:grid-cols-1">
      <div>
        <UiSectionLabel v-if="label">{{ label }}</UiSectionLabel>
        <UiPageTitle>{{ block.title }}</UiPageTitle>
      </div>
      <div>
        <div class="flex flex-col gap-4 text-[15px] leading-[1.8] text-muted">
          <p v-for="(paragraph, i) in paragraphs(block.intro)" :key="i" class="m-0">{{ paragraph }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
