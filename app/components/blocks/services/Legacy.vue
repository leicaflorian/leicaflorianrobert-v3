<script setup lang="ts">
import type {BlockServices, Service} from '~/types/content'

defineProps<{block: BlockServices}>()

const services = await useCollection<Service>('services')
</script>

<template>
  <BlocksLegacyHeading>{{ block.title }}</BlocksLegacyHeading>
  <ul class="m-0 list-disc pl-[22px]">
    <li v-for="service in services" :key="service.id">{{ service.title }}</li>
  </ul>
</template>
