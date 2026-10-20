<script setup lang="ts">
const {mode} = useEngine()
const route = useRoute()
// the CV page is a bare sheet: no layout, no engine switch
const bare = computed(() => route.meta.layout === false)
const i18nHead = useLocaleHead()
const {siteUrl, cookieyesId} = useRuntimeConfig().public

useHead(() => ({
  // data-engine-mode: CookieYes adds its banner outside the layout, main.css styles it from here
  htmlAttrs: {'lang': i18nHead.value.htmlAttrs.lang, 'data-engine-mode': mode.value},
  link: [...(i18nHead.value.link ?? [])],
  meta: [...(i18nHead.value.meta ?? [])],
  // CookieYes asks to be the first script; not on the CV sheet, which is printed to PDF
  script: cookieyesId && !bare.value
    ? [{id: 'cookieyes', src: `https://cdn-cookieyes.com/client_data/${cookieyesId}/script.js`, tagPriority: 'critical' as const}]
    : [],
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
