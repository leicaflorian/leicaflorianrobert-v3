<!--
  The CV on one A4 page: a warm grey column (photo, contacts, stack, languages, education) and
  the profile and experiences beside it. The experiences go in newest first while they fit;
  when some are left out, the title says how many are shown ("latest 9 experiences").
  `data-cv-ready` tells scripts/cv-pdf.mjs the sheet is laid out.
-->
<script setup lang="ts">
import type {CvData} from '~/types/cv'

const props = defineProps<{data: CvData}>()

/** The bottom of the page's content, from the sheet's top: A4 minus the bottom margin. */
const CONTENT_BOTTOM_MM = 297 - 12
const PX_PER_MM = 96 / 25.4

const contactLink = 'text-dim hover:text-paper-ink'

const sheet = useTemplateRef('sheet')
const shown = ref(props.data.experiences.length)
const ready = ref(false)
const experiences = computed(() => props.data.experiences.slice(0, shown.value))

// Fit the experiences after the fonts are in: their height decides how many fit.
onMounted(async () => {
  await document.fonts.ready
  const limit = sheet.value!.getBoundingClientRect().top + CONTENT_BOTTOM_MM * PX_PER_MM
  const bottoms = [...sheet.value!.querySelectorAll('[data-cv-experience]')].map(el => el.getBoundingClientRect().bottom)
  const fitting = bottoms.findIndex(bottom => bottom > limit)
  if (fitting !== -1) shown.value = Math.max(1, fitting)
  ready.value = true
})
</script>

<template>
  <article ref="sheet" :data-cv-ready="ready || undefined" class="mx-auto flex min-h-[297mm] w-[210mm] bg-paper pr-[14mm] pl-[14mm] font-sans text-[9pt] leading-[1.5] text-paper-ink shadow-[0_2px_24px_rgb(0_0_0/0.25)] [print-color-adjust:exact] print:block print:shadow-none">
    <aside data-cv-side class="mr-[10mm] -ml-[14mm] flex w-[74mm] shrink-0 print:float-left print:h-[297mm] flex-col gap-[5mm] overflow-hidden bg-paper-side px-[8mm] py-[11mm]">
      <div>
        <div class="relative mx-auto size-[34mm] overflow-hidden rounded-full bg-paper-line/40">
          <!-- head and shoulders, the crop chosen on the mockups; a 640px copy keeps the PDF light -->
          <img src="/imgs/me-cv.webp" alt="" class="absolute top-[3%] left-[-31%] w-[160%] max-w-none">
        </div>
        <h1 class="m-0 mt-[5mm] font-mono text-[16pt] leading-[1.1] font-bold">
          {{ data.name }}<span class="text-accent">_</span>
        </h1>
        <p class="m-0 mt-[1.5mm] font-mono text-[9pt] text-accent-ink">{{ data.role }}</p>
      </div>

      <section>
        <CvHeading>{{ $t('cv.contacts') }}</CvHeading>
        <ul class="m-0 flex list-none flex-col gap-[0.6mm] p-0 font-mono text-[7pt] text-dim">
          <!-- links, so they can be clicked in the PDF; paper colours, not the site's orange links -->
          <li><a :href="`mailto:${data.email}`" :class="contactLink">{{ data.email }}</a></li>
          <li><a :href="data.website" :class="contactLink">{{ hostOf(data.website) }}</a></li>
          <li><a :href="data.linkedin" :class="contactLink">{{ shortUrl(data.linkedin) }}</a></li>
          <li><a :href="data.github" :class="contactLink">{{ shortUrl(data.github) }}</a></li>
          <li>{{ data.city }}</li>
        </ul>
      </section>

      <section>
        <CvHeading>{{ $t('cv.stack') }}</CvHeading>
        <ul class="m-0 flex list-none flex-wrap gap-[1.2mm] p-0 font-mono text-[7pt]">
          <li v-for="tech in data.stack" :key="tech" class="rounded-[2px] border border-paper-line bg-paper px-[1.5mm] py-[0.4mm]">{{ tech }}</li>
        </ul>
      </section>

      <section>
        <CvHeading>{{ $t('cv.languages') }}</CvHeading>
        <ul class="m-0 flex list-none flex-col gap-[0.8mm] p-0 text-[8pt]">
          <li v-for="language in data.languages" :key="language.id">
            <b class="font-semibold">{{ language.name }}</b> <span class="text-dim">· {{ language.level }}</span>
          </li>
        </ul>
      </section>

      <section>
        <CvHeading>{{ $t('cv.education') }}</CvHeading>
        <ul class="m-0 flex list-none flex-col gap-[1.8mm] p-0 text-[8pt]">
          <li v-for="item in data.education" :key="item.id">
            <b class="block font-semibold">{{ item.title }}</b>
            <span class="text-dim">{{ institutionOf(item) }}<template v-if="item.place">, {{ item.place }}</template> · <span class="font-mono text-[7pt] whitespace-nowrap">{{ periodOf(item, $t('about.now')) }}</span></span>
          </li>
        </ul>
      </section>
    </aside>

    <div class="min-w-0 flex-1">
      <section class="pt-[12mm]">
        <CvHeading>{{ $t('cv.profile') }}</CvHeading>
        <p v-for="(paragraph, i) in paragraphs(data.profile)" :key="i" class="m-0 mb-[2mm] text-[10pt] leading-[1.55] last:mb-0">{{ paragraph }}</p>
      </section>

      <section class="pt-[7mm]">
        <CvHeading>
          {{ shown < data.experiences.length ? $t('cv.latest', {n: shown}) : $t('cv.experience') }}
        </CvHeading>
        <div
          v-for="exp in experiences"
          :key="exp.id"
          data-cv-experience
          class="mb-[4mm] break-inside-avoid"
        >
          <div class="flex items-baseline justify-between gap-[4mm]">
            <b class="font-semibold">{{ companyOf(exp) }}</b>
            <span class="shrink-0 font-mono text-[7.5pt] text-dim">{{ periodOf(exp, $t('about.now')) }}</span>
          </div>
          <p class="m-0 font-mono text-[8pt] text-accent-ink">{{ exp.role }}</p>
          <p v-if="exp.description" class="m-0 mt-[0.8mm] text-dim">{{ exp.description }}</p>
        </div>
      </section>
    </div>
  </article>
</template>
