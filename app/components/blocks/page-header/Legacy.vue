<script setup lang="ts">
import type {BlockPageHeader, Site} from '~/types/content'

const props = defineProps<{block: BlockPageHeader}>()

const site = await useSingleton<Site>('site')
const stats = props.block.variant === 'about' ? await useAboutStats() : null
</script>

<template>
  <h2 class="m-0 mb-3 text-[26px] font-bold">{{ block.title }}</h2>
  <div v-if="block.variant === 'about'" class="grid grid-cols-[180px_1fr] items-start gap-6 max-[860px]:grid-cols-1">
    <div class="border-2 border-black bg-legacy-frame p-[5px]">
      <div class="border border-legacy-inset bg-legacy-light [border-style:inset] p-1">
        <UiAsciiPortrait src="/imgs/me-transparent.webp" variant="legacy" :cols="64" :label="site.name"/>
      </div>
      <p class="m-0 mt-1.5 text-center font-legacy-mono text-[13px]">{{ $t('about.legacy.ascii') }}</p>
    </div>
    <div>
      <p v-for="(paragraph, i) in paragraphs(block.intro)" :key="i" class="m-0 mb-3">{{ paragraph }}</p>
      <p v-if="stats" class="m-0 mb-3">{{ $t('about.legacy.years') }} <b>{{ stats.years }}</b></p>
    </div>
  </div>
  <p v-for="(paragraph, i) in paragraphs(block.intro)" v-else :key="i" class="m-0 mb-3">{{ paragraph }}</p>
</template>
