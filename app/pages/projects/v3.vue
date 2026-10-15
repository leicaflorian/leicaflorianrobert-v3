<script setup lang="ts">
import type {PageCaseStudy} from '~/types/content'

const {isNative} = useEngine()

const page = await useSingleton<PageCaseStudy>('page_case_study')

useSeoMeta({
  title: () => page.value.title,
  description: () => page.value.intro,
})
</script>

<template>
  <CaseStudyNative v-if="isNative" :page="page"/>
  <CaseStudyLegacy v-else :page="page"/>
</template>
