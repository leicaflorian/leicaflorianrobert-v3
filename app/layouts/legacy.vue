<!--
  Legacy mode: a '90s hypertext with name, profession, a menu of blue links,
  the page, and at the bottom the button that "switches on" native mode.
-->
<script setup lang="ts">
import type {Site} from '~/types/content'

const site = await useSingleton<Site>('site')
const route = useRoute()
const routeBaseName = useRouteBaseName()
const {toggle} = useEngine()

const items = [
  {name: 'index', label: 'legacyNav.home'},
  {name: 'about', label: 'legacyNav.about'},
  {name: 'projects', label: 'legacyNav.projects'},
  {name: 'contact', label: 'legacyNav.contact'},
] as const

const current = computed(() => String(routeBaseName(route) ?? 'index').split('-')[0])
</script>

<template>
  <div data-engine="legacy" class="min-h-screen bg-white font-legacy text-[17px] leading-normal text-black">
    <div class="mx-auto max-w-[880px] px-6 pb-12 pt-8">
      <h1 class="m-0 mb-1.5 text-[34px] font-bold">{{ site.name }}</h1>
      <p class="m-0 mb-3.5">{{ $t('engine.profession', {profession: site.profession}) }}</p>
      <nav class="flex flex-wrap gap-4">
        <LegacyLink v-for="item in items" :key="item.name" :to="item.name" :current="current === item.name">
          {{ $t(item.label) }}
        </LegacyLink>
      </nav>
      <hr class="mb-6 mt-[18px] border-0 border-t-2 border-black">

      <slot/>

      <hr class="my-8 border-0 border-t border-black">
      <div class="flex flex-col items-center gap-3 text-center">
        <button
          type="button"
          class="cursor-pointer border-2 border-legacy-light border-r-legacy-shadow border-b-legacy-shadow bg-legacy-face px-[22px] py-3 font-legacy-mono text-base font-bold text-black active:border-legacy-shadow active:border-r-legacy-light active:border-b-legacy-light"
          @click="toggle"
        >
          {{ $t('engine.activate') }}
        </button>
        <p class="m-0 text-sm text-legacy-note">{{ $t('engine.optimized') }}</p>
      </div>
    </div>
  </div>
</template>
