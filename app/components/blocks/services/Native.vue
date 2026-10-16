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
      <div
        class="mt-14 grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6
               max-[640px]:flex max-[640px]:snap-x max-[640px]:snap-mandatory max-[640px]:overflow-x-auto max-[640px]:pb-2
               max-[640px]:[&>*]:shrink-0 max-[640px]:[&>*]:basis-[84%] max-[640px]:[&>*]:snap-start"
      >
        <ServiceCard v-for="(service, i) in services" :key="service.id" :service="service" :index="i"/>
      </div>
    </div>
  </section>
</template>
