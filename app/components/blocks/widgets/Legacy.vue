<!-- The widgets are animations for native mode: a '90s page has none, only the title if there is one. -->
<script setup lang="ts">
import type {BlockWidgets} from '~/types/content'

defineProps<{block: BlockWidgets}>()
</script>

<template>
  <BlocksLegacyHeading v-if="block.title">{{ block.title }}</BlocksLegacyHeading>
</template>
