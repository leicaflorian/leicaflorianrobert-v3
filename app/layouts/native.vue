<!-- Native mode: header, the page, footer. -->
<script setup lang="ts">
import type {Site} from '~/types/content'

// the pages are loaded here so the header can build the menu without waiting
const [site] = await Promise.all([useSingleton<Site>('site'), usePages()])
</script>

<template>
  <div data-engine="native" class="flex min-h-screen flex-col bg-bg font-mono text-ink">
    <SiteHeader/>
    <main class="flex-1">
      <slot/>
    </main>
    <SiteFooter :site="site"/>
  </div>
</template>
