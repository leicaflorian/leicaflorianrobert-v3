<!--
  The CV, the one route outside the Directus pages: a bare A4 sheet with no layout or engine.
  Nothing links here; scripts/cv-pdf.mjs prints it to the PDF the "Download CV" button serves.
-->
<script setup lang="ts">
definePageMeta({layout: false})

const {t} = useI18n()
const cv = await useCvData()

useHead({
  title: t('cv.title'),
  htmlAttrs: {class: 'cv-sheet'},
  meta: [{name: 'robots', content: 'noindex'}],
})
</script>

<template>
  <CvSheet :data="cv"/>
</template>
