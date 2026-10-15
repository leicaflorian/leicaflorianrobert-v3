<script setup lang="ts">
const {mode} = useEngine()
const i18nHead = useLocaleHead()

useHead(() => ({
  htmlAttrs: {lang: i18nHead.value.htmlAttrs.lang},
  link: [...(i18nHead.value.link ?? [])],
  meta: [...(i18nHead.value.meta ?? [])],
  titleTemplate: title => title ? `${title} — Leica Florian Robert` : 'Leica Florian Robert',
}))
</script>

<template>
  <NuxtRouteAnnouncer/>
  <NuxtLayout :name="mode">
    <NuxtPage/>
  </NuxtLayout>
  <SiteEngineBoot/>
</template>
