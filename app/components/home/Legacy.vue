<script setup lang="ts">
import type {PageHome, Project, Service, Site} from '~/types/content'

defineProps<{
  site: Site
  page: PageHome
  services: Service[]
  projects: Project[]
}>()

const linkOf = useProjectLink()
</script>

<template>
  <div class="grid grid-cols-[220px_1fr] items-start gap-6 max-[860px]:grid-cols-1">
    <LegacyPhoto :caption="$t('home.legacy.figure')"/>
    <div>
      <h2 class="m-0 mb-2.5 text-2xl font-bold">{{ $t('home.legacy.title') }}</h2>
      <p class="m-0 mb-3">{{ page.legacy_text }}</p>
      <h3 class="m-0 mb-1.5 mt-[18px] text-[19px] font-bold">{{ $t('home.legacy.services') }}</h3>
      <ul class="m-0 list-disc pl-[22px]">
        <li v-for="service in services" :key="service.id">{{ service.title }}</li>
      </ul>
      <h3 class="m-0 mb-1.5 mt-[18px] text-[19px] font-bold">{{ $t('home.legacy.projects') }}</h3>
      <ul class="m-0 list-disc pl-[22px]">
        <li v-for="project in projects" :key="project.id">
          <LegacyLink :href="linkOf(project).href">{{ project.name }}</LegacyLink>
        </li>
      </ul>
      <p class="m-0 mt-[18px]">
        {{ $t('home.legacy.write') }} <LegacyLink :href="`mailto:${site.email}`">{{ site.email }}</LegacyLink>
      </p>
    </div>
  </div>
</template>
