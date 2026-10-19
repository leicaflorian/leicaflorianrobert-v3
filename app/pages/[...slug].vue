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

const title = () => caseStudy?.value?.name ?? page!.seo_title ?? page!.title
const description = () => caseStudy?.value?.intro ?? page!.description
// A case study falls back to its cover, then its screenshot (not a phone one: cropped to
// 1200×630 it's a thin slice); every page to the site's /og.png, set in app.vue.
const project = caseStudy?.value
const ogImageId = project
  ? project.og_image ?? project.cover ?? (project.mockup === 'phone' ? null : project.image)
  : page!.og_image
const {directusUrl} = useRuntimeConfig().public

useSeoMeta({
  title,
  description,
  ogTitle: () => fullTitle(title()),
  ogDescription: description,
  ogType: project ? 'article' : 'website',
  ...ogImageId && {
    // JPEG, which every social network reads; `fit=cover` crops to the card's size
    ogImage: `${directusUrl}/assets/${ogImageId}?width=${OG_IMAGE_SIZE.width}&height=${OG_IMAGE_SIZE.height}&fit=cover&format=jpg`,
    ogImageAlt: title,
  },
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
