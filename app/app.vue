<script setup lang="ts">
const {mode} = useEngine()
const route = useRoute()
// the CV page is a bare sheet: no layout, no engine switch
const bare = computed(() => route.meta.layout === false)
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
  <NuxtLayout :name="bare ? false : mode">
    <NuxtPage/>
  </NuxtLayout>
  <SiteEngineBoot v-if="!bare"/>
</template>
