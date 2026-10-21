<!--
  Every page of the site. The path is matched against the page slugs in Directus;
  under a page with `children` (Projects), `/<page>/<slug>` is a project's case study.
-->
<script setup lang="ts">
import type {Page} from '~/types/content'
import type {OgCard} from '~/utils/seo'

const {isNative} = useEngine()
const {locale, locales} = useI18n()
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

const {directusUrl, siteUrl} = useRuntimeConfig().public
const route = useRoute()
/** A Directus image cropped to `width`×`height`, as JPEG: every social network reads it. */
const asset = (id: string, width: number, height?: number) =>
  `${directusUrl}/assets/${id}?width=${width}${height ? `&height=${height}&fit=cover` : ''}&format=jpg`

// An image uploaded in Directus wins (a case study's `cover` too); otherwise the card is drawn
// at build time by scripts/og-cards.mjs, from the og-card meta. A phone screenshot shows in a
// phone, not cropped to 1200×630.
const project = caseStudy?.value
const uploaded = project ? project.og_image ?? project.cover : page!.og_image
const card: OgCard = {
  label: `// ${[(parent ?? page)!.title.toLowerCase(), project?.year].filter(Boolean).join(' · ')}`,
  title: title(),
  text: project ? project.subtitle ?? project.intro : page!.description,
  prompt: ['~/leica', path].filter(Boolean).join('/'),
  locale: locale.value,
  ...project?.image && {shot: {src: asset(project.image, project.mockup === 'phone' ? 480 : 1200), phone: project.mockup === 'phone'}},
}

useSeoMeta({
  title,
  description,
  ogTitle: () => fullTitle(title()),
  ogDescription: description,
  ogType: project ? 'article' : 'website',
  // the home keeps the site's /og.png, set in app.vue
  ...(uploaded || path) && {
    ogImage: uploaded ? asset(uploaded, OG_IMAGE_SIZE.width, OG_IMAGE_SIZE.height) : `${siteUrl}/og${route.path.replace(/\/$/, '')}.png`,
    ogImageAlt: title,
  },
})
if (!uploaded && path) useHead({meta: [{name: 'og-card', content: JSON.stringify(card)}]})

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
