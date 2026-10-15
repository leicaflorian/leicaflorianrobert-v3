<!-- A featured project, with the screenshot inside a laptop or phone outline. -->
<script setup lang="ts">
import type {Project} from '~/types/content'

const props = defineProps<{project: Project}>()
const subtitle = computed(() => props.project.subtitle || hostOf(props.project.url))
</script>

<template>
  <ProjectLink
    :project="project"
    class="spring flex flex-col gap-8 rounded-2xl border border-line-card px-9 pb-8 pt-12 text-ink hover:-translate-y-1 hover:border-accent hover:text-ink"
    :class="project.mockup === 'laptop' ? 'bg-[linear-gradient(160deg,var(--color-accent-deep),var(--color-surface)_60%)]' : 'bg-surface'"
  >
    <div v-if="project.mockup === 'laptop'" class="m-auto w-full max-w-[620px]">
      <div class="overflow-hidden rounded-[12px_12px_4px_4px] border-10 border-b-14 border-[#232327] bg-black shadow-[0_24px_60px_rgb(0_0_0/0.5)]">
        <div class="aspect-16/10">
          <UiMediaImage :id="project.image" :alt="project.name" :width="1240"/>
        </div>
      </div>
      <div class="-mx-[6%] h-3 rounded-b-[14px] bg-[linear-gradient(#2E2E33,#1C1C1F)]"/>
    </div>

    <div v-else class="flex flex-1 items-center justify-center">
      <div class="w-[200px] overflow-hidden rounded-[34px] border-8 border-[#232327] bg-black shadow-[0_24px_60px_rgb(0_0_0/0.5)]">
        <div class="aspect-[9/19.5]">
          <UiMediaImage :id="project.image" :alt="project.name" :width="400"/>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 class="m-0 text-xl font-bold">{{ project.name }}</h3>
        <p class="m-0 mt-1.5 text-[13px] text-subtle">{{ subtitle }}</p>
      </div>
      <span class="text-xl text-accent">↗</span>
    </div>
  </ProjectLink>
</template>
