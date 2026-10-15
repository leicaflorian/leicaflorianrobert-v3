<script setup lang="ts">
import type {Experience, PageAbout, Technology} from '~/types/content'

defineProps<{
  page: PageAbout
  experiences: Experience[]
  technologies: Technology[]
  years: number
}>()
</script>

<template>
  <h2 class="m-0 mb-3 text-[26px] font-bold">{{ $t('about.legacy.title') }}</h2>
  <div class="grid grid-cols-[180px_1fr] items-start gap-6 max-[860px]:grid-cols-1">
    <LegacyPhoto/>
    <div>
      <p class="m-0 mb-3">{{ page.intro }}</p>
      <p v-for="(paragraph, i) in paragraphs(page.story)" :key="i" class="m-0 mb-3">{{ paragraph }}</p>
      <p class="m-0 mb-3">{{ $t('about.legacy.years') }} <b>{{ years }}</b></p>
    </div>
  </div>

  <h3 class="m-0 mb-2 mt-6 text-xl font-bold">{{ $t('about.legacy.experiences') }}</h3>
  <table class="w-full border-collapse text-base">
    <tbody>
      <tr v-for="exp in experiences" :key="exp.id">
        <td class="w-[60px] border border-black p-1.5">{{ exp.year ?? '—' }}</td>
        <td class="border border-black p-1.5">
          <LegacyLink v-if="exp.link" :href="exp.link">{{ exp.company }}</LegacyLink>
          <template v-else>{{ exp.company }}</template>
        </td>
        <td class="border border-black p-1.5">{{ exp.role }}</td>
      </tr>
    </tbody>
  </table>

  <h3 class="m-0 mb-2 mt-6 text-xl font-bold">{{ $t('about.legacy.tech') }}</h3>
  <p class="m-0 text-base">{{ technologies.map(t => t.name).join(', ') }}.</p>
</template>
