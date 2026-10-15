<script setup lang="ts">
import type {PageHome, Project, Service, Site} from '~/types/content'

const props = defineProps<{
  site: Site
  page: PageHome
  services: Service[]
  projects: Project[]
}>()

const featured = computed(() => props.projects.filter(p => p.featured))
const more = computed(() => props.projects.filter(p => !p.featured))
</script>

<template>
  <HomeHero :site="site" :page="page"/>

  <section class="border-t border-line">
    <div class="page section-y">
      <UiSectionLabel>{{ $t('home.services.label') }}</UiSectionLabel>
      <UiSectionTitle class="mb-4">{{ $t('home.services.title') }}</UiSectionTitle>
      <p class="m-0 max-w-[640px] text-[15px] leading-[1.8] text-muted">{{ page.services_text }}</p>
      <div
        class="mt-14 grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6
               max-[640px]:flex max-[640px]:snap-x max-[640px]:snap-mandatory max-[640px]:overflow-x-auto max-[640px]:pb-2
               max-[640px]:[&>*]:shrink-0 max-[640px]:[&>*]:basis-[84%] max-[640px]:[&>*]:snap-start"
      >
        <ServiceCard v-for="(service, i) in services" :key="service.id" :service="service" :index="i"/>
      </div>
    </div>
  </section>

  <section class="border-t border-line">
    <div class="page section-y">
      <div class="mb-14 flex flex-wrap items-end justify-between gap-5">
        <div>
          <UiSectionLabel>{{ $t('home.projects.label') }}</UiSectionLabel>
          <UiSectionTitle>{{ $t('home.projects.title') }}</UiSectionTitle>
        </div>
        <NuxtLinkLocale to="projects" class="border-b border-accent pb-1 text-sm text-ink hover:text-ink">
          {{ $t('home.projects.all') }}
        </NuxtLinkLocale>
      </div>
      <ProjectFeaturedGrid :projects="featured"/>
      <div v-if="more.length" class="mt-6 grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
        <ProjectCard v-for="project in more" :key="project.id" :project="project" variant="compact"/>
      </div>
    </div>
  </section>

  <ContactFormSection
    :label="$t('home.contact.label')"
    :title="$t('home.contact.title')"
    :text="page.contact_text"
    :image="page.contact_image"
  />
</template>
