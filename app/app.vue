<script setup lang="ts">
const {mode} = useEngine()
const route = useRoute()
// the CV page is a bare sheet: no layout, no engine switch
const bare = computed(() => route.meta.layout === false)
const i18nHead = useLocaleHead()
const {siteUrl} = useRuntimeConfig().public

useHead(() => ({
  htmlAttrs: {lang: i18nHead.value.htmlAttrs.lang},
  link: [...(i18nHead.value.link ?? [])],
  meta: [...(i18nHead.value.meta ?? [])],
  titleTemplate: fullTitle,
}))

// Social cards for every page; the Directus pages override title, description and image.
useSeoMeta({
  ogSiteName: SITE_NAME,
  ogType: 'website',
  ogImage: `${siteUrl}/og.png`,
  ogImageWidth: OG_IMAGE_SIZE.width,
  ogImageHeight: OG_IMAGE_SIZE.height,
  ogImageAlt: SITE_NAME,
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <NuxtRouteAnnouncer/>
  <NuxtLayout :name="bare ? false : mode">
    <NuxtPage/>
  </NuxtLayout>
  <SiteEngineBoot v-if="!bare"/>
</template>
