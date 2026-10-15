<script setup lang="ts">
import type {Site} from '~/types/content'

defineProps<{site: Site}>()
</script>

<template>
  <h2 class="m-0 mb-3 text-[26px] font-bold">{{ $t('contact.title') }}</h2>
  <p class="m-0"><b>{{ site.name }}</b><br>{{ site.street }}<br>{{ site.postal_code }} {{ site.city }}, {{ site.province }}</p>
  <p class="m-0 mt-3">{{ $t('contact.legacy.vat', {vat: site.vat, rea: site.rea, sdi: site.sdi}) }}</p>
  <p class="m-0 mt-3">
    {{ $t('contact.legacy.email') }} <LegacyLink :href="`mailto:${site.email}`">{{ site.email }}</LegacyLink><br>
    {{ $t('contact.legacy.pec') }} <LegacyLink :href="`mailto:${site.pec}`">{{ site.pec }}</LegacyLink>
  </p>
  <p class="m-0 mt-3">
    GitHub: <LegacyLink :href="site.github">{{ shortUrl(site.github) }}</LegacyLink><br>
    LinkedIn: <LegacyLink :href="site.linkedin">{{ shortUrl(site.linkedin) }}</LegacyLink>
  </p>
  <h3 class="m-0 mb-2 mt-6 text-xl font-bold">{{ $t('form.legacy.title') }}</h3>
  <LegacyForm/>
</template>
