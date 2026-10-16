<!--
  Every page of the site. The path is matched against the page slugs in Directus;
  under a page with `children` (Projects), `/<page>/<slug>` is a project's case study.
-->
<script setup lang="ts">
import type {Page} from '~/types/content'

const {isNative} = useEngine()
const {locales} = useI18n()
const path = useCurrentPath().value
const pages = await usePages()

const segments = path.split('/')
const child = segments.pop()!
const page = pages.value.find(p => p.slug === path)
const parent = page ? undefined : pages.value.find(p => p.children === 'projects' && p.slug === segments.join('/'))
const caseStudy = parent ? await useCaseStudy(child) : undefined

if (!page && !caseStudy?.value) {
  throw createError({statusCode: 404, statusMessage: 'Page not found', fatal: true})
}

// optional: on a 404 the template can still render once before the error page
const sections = computed(() => (caseStudy?.value ?? pages.value.find(p => p.id === page?.id))?.sections)

useSeoMeta({
  title: () => caseStudy?.value?.name ?? page!.seo_title ?? page!.title,
  description: () => caseStudy?.value?.intro ?? page!.description,
})

// The language switcher leads to the same page with the slug of the other language.
const {data: raw} = useNuxtData<RawItem[]>(PAGES_KEY)
const rawPage = (raw.value ?? []).find(p => p.id === (page ?? parent)!.id)!
const setI18nParams = useSetI18nParams()
setI18nParams(Object.fromEntries(locales.value.map(({code}) => {
  const slug = translateItem<Page>(rawPage, code).slug
  return [code, {slug: [...slug.split('/'), ...(parent ? [child] : [])].filter(Boolean)}]
})))
</script>

<template>
  <div>
    <template v-if="caseStudy">
      <CaseStudyHeaderNative v-if="isNative" :project="caseStudy"/>
      <CaseStudyHeaderLegacy v-else :project="caseStudy"/>
    </template>
    <BlocksRenderer v-if="sections" :sections="sections"/>
  </div>
</template>
