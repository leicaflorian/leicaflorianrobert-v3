<!--
  The top of a page: label, large title and intro. The variants add the portrait and
  the numbers (About), the number of projects (Projects), availability and email (Contact).
-->
<script setup lang="ts">
import type {BlockPageHeader, Site} from '~/types/content'

const props = defineProps<{block: BlockPageHeader}>()

const site = await useSingleton<Site>('site')
const stats = props.block.variant === 'about' ? await useAboutStats() : null
const projects = props.block.variant === 'projects' ? await usePublishedProjects() : null

const label = computed(() => props.block.label?.replace('{n}', String(projects?.value.length ?? 0)))
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
        <div class="absolute inset-[12%_6%_0_6%] rounded-full bg-accent opacity-[0.22] blur-[100px]"/>
        <div class="relative aspect-4/5 overflow-hidden rounded-[20px]">
          <UiMediaImage :id="block.image" :alt="$t('about.portrait')" :width="900"/>
        </div>
      </div>
    </div>
  </section>

  <section v-else>
    <div class="page grid grid-cols-2 items-end gap-18 pb-30 pt-28 max-[860px]:grid-cols-1">
      <div>
        <UiAvailableBadge v-if="block.variant === 'contact' && site.available"/>
        <UiSectionLabel v-if="label">{{ label }}</UiSectionLabel>
        <UiPageTitle :class="block.variant === 'contact' && 'mt-8'">{{ block.title }}</UiPageTitle>
      </div>
      <div>
        <div class="flex flex-col gap-4 text-[15px] leading-[1.8] text-muted">
          <p v-for="(paragraph, i) in paragraphs(block.intro)" :key="i" class="m-0">{{ paragraph }}</p>
        </div>
        <a
          v-if="block.variant === 'contact'"
          :href="`mailto:${site.email}`"
          class="mt-5 inline-block break-all border-b-2 border-accent pb-1.5 text-[clamp(16px,2vw,22px)] font-bold text-ink hover:text-accent"
        >{{ site.email }} ↗</a>
      </div>
    </div>
  </section>
</template>
