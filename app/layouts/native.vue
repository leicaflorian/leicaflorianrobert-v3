<!-- Native mode: header, the page, footer. -->
<script setup lang="ts">
import type {Site} from '~/types/content'

const site = await useSingleton<Site>('site')
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
