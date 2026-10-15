<script setup lang="ts">
import type {PageContact, Site} from '~/types/content'

const {isNative} = useEngine()
const {t} = useI18n()

const [site, page] = await Promise.all([
  useSingleton<Site>('site'),
  useSingleton<PageContact>('page_contact'),
])

useSeoMeta({
  title: () => t('contact.title'),
  description: () => page.value.intro,
})
</script>

<template>
  <ContactNative v-if="isNative" :site="site" :page="page"/>
  <ContactLegacy v-else :site="site"/>
</template>
