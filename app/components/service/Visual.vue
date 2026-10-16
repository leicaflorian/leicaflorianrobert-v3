<!-- A service's picture: the image uploaded in Directus, or its illustration in code. -->
<script setup lang="ts">
import type {Component} from 'vue'
import type {Service, ServiceIcon} from '~/types/content'
import {
  ServiceVisualAi, ServiceVisualConsulenza, ServiceVisualDesign, ServiceVisualDevops, ServiceVisualFormazione,
  ServiceVisualMobile, ServiceVisualWeb,
} from '#components'

defineProps<{service: Service}>()

const VISUALS: Record<ServiceIcon, Component> = {
  web: ServiceVisualWeb,
  mobile: ServiceVisualMobile,
  design: ServiceVisualDesign,
  devops: ServiceVisualDevops,
  ai: ServiceVisualAi,
  formazione: ServiceVisualFormazione,
  consulenza: ServiceVisualConsulenza,
}
</script>

<template>
  <UiMediaImage v-if="service.image" :id="service.image" :alt="service.title" :width="720"/>
  <component :is="VISUALS[service.icon]" v-else-if="VISUALS[service.icon]" aria-hidden="true"/>
</template>
