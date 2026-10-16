<script setup lang="ts">
import type {BlockServices, Service} from '~/types/content'

defineProps<{
  block: BlockServices
  /** The label with its number. */
  label?: string
}>()

const services = await useCollection<Service>('services')
</script>

<template>
  <section class="border-t border-line">
    <div class="page section-y">
      <UiSectionLabel v-if="label">{{ label }}</UiSectionLabel>
      <UiSectionTitle class="mb-4">{{ block.title }}</UiSectionTitle>
      <p v-if="block.text" class="m-0 max-w-[640px] text-[15px] leading-[1.8] text-muted">{{ block.text }}</p>
      <ServiceGuide :services="services" class="mt-14"/>
    </div>
  </section>
</template>
