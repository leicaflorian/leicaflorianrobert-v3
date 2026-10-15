<script setup lang="ts">
import type {Site} from '~/types/content'

defineProps<{ site: Site }>()

const year = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-line bg-bg">
    <div class="page grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-10 pb-9 pt-16">
      <div>
        <div class="mb-4">
          <SiteLogo size="lg"/>
        </div>
        <p class="m-0 max-w-[340px] text-[13px] leading-[1.75] text-subtle">{{ site.tagline }}</p>
      </div>
      <div>
        <h3 class="m-0 mb-4 text-xs font-medium text-accent">{{ $t('footer.contacts') }}</h3>
        <div class="flex flex-col gap-2.5 text-[13px]">
          <a :href="`mailto:${site.email}`" class="text-ink-soft hover:text-accent-light">{{ site.email }}</a>
          <span class="text-subtle">{{ $t('footer.location', {city: site.city, province: site.province}) }}</span>
        </div>
      </div>
      <div>
        <h3 class="m-0 mb-4 text-xs font-medium text-accent">{{ $t('footer.social') }}</h3>
        <div class="flex flex-col gap-2.5 text-[13px]">
          <a :href="site.github" target="_blank" rel="noopener" class="text-ink-soft hover:text-accent-light">GitHub ↗</a>
          <a :href="site.linkedin" target="_blank" rel="noopener" class="text-ink-soft hover:text-accent-light">LinkedIn ↗</a>
        </div>
      </div>
    </div>
    <div class="border-t border-line">
      <div class="page flex flex-wrap justify-between gap-3 py-[22px] text-xs text-faint">
        <p class="m-0">{{ $t('footer.rights', {year, name: site.name}) }}</p>
        <p class="m-0">{{ $t('footer.vat', {vat: site.vat}) }}</p>
      </div>
    </div>
  </footer>
</template>
