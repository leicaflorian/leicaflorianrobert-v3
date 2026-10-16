<script setup lang="ts">
import type {Component} from 'vue'
import type {Service, ServiceIcon} from '~/types/content'
import {
  ServiceVisualConsulenza, ServiceVisualDesign, ServiceVisualDevops, ServiceVisualFormazione,
  ServiceVisualMobile, ServiceVisualWeb,
} from '#components'

defineProps<{
  service: Service
  index: number
}>()

/** Without an image in Directus, the card shows the service's illustration. */
const VISUALS: Record<ServiceIcon, Component> = {
  web: ServiceVisualWeb,
  mobile: ServiceVisualMobile,
  design: ServiceVisualDesign,
  devops: ServiceVisualDevops,
  formazione: ServiceVisualFormazione,
  consulenza: ServiceVisualConsulenza,
}
</script>

<template>
  <div class="spring group flex flex-col overflow-hidden rounded-2xl border border-line-card bg-surface hover:-translate-y-1.5 hover:border-accent">
    <div class="h-[200px] shrink-0">
      <UiMediaImage v-if="service.image" :id="service.image" :alt="service.title" :width="720"/>
      <component :is="VISUALS[service.icon]" v-else-if="VISUALS[service.icon]" aria-hidden="true"/>
    </div>
    <div class="flex flex-col gap-3 p-7">
      <div class="flex items-center justify-between">
        <ServiceIcon :name="service.icon" class="size-10 rounded-[10px] bg-accent/12 p-[9px] text-accent"/>
        <span class="text-xs text-dim">{{ String(index + 1).padStart(2, '0') }}</span>
      </div>
      <h3 class="m-0 mt-2 text-lg font-bold">{{ service.title }}</h3>
      <p class="m-0 text-sm leading-[1.75] text-muted">{{ service.text }}</p>
    </div>
  </div>
</template>
