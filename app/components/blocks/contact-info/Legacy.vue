<script setup lang="ts">
import type {BlockContactInfo, Site} from '~/types/content'

defineProps<{block: BlockContactInfo}>()

const site = await useSingleton<Site>('site')
const cvLink = useCvLink()
</script>

<template>
  <BlocksLegacyHeading v-if="block.title">{{ block.title }}</BlocksLegacyHeading>
  <p class="m-0"><b>{{ site.name }}</b><br>{{ site.city }} ({{ site.province }})</p>
  <p class="m-0 mt-3">{{ $t('contact.legacy.vat', {vat: site.vat, rea: site.rea, sdi: site.sdi}) }}</p>
  <p class="m-0 mt-3">
    {{ $t('contact.legacy.email') }} <LegacyLink :href="`mailto:${site.email}`">{{ site.email }}</LegacyLink><br>
    {{ $t('contact.legacy.pec') }} <LegacyLink :href="`mailto:${site.pec}`">{{ site.pec }}</LegacyLink>
  </p>
  <p v-if="block.cv_button" class="m-0 mt-3"><LegacyLink :href="cvLink" download>{{ $t('cv.legacy.download') }}</LegacyLink></p>
  <p class="m-0 mt-3">
    GitHub: <LegacyLink :href="site.github">{{ shortUrl(site.github) }}</LegacyLink><br>
    LinkedIn: <LegacyLink :href="site.linkedin">{{ shortUrl(site.linkedin) }}</LegacyLink>
  </p>
</template>
