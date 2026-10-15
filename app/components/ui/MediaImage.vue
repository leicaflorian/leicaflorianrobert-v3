<!--
  An image from the Directus library. Until the image exists, a dashed box with
  the description takes its place, like the design's placeholders.
-->
<script setup lang="ts">
import type {FileId} from '~/types/content'

defineProps<{
  id: FileId
  alt: string
  /** Maximum width in pixels at which Directus returns the image. */
  width?: number
}>()
</script>

<template>
  <NuxtImg
    v-if="id"
    :src="id"
    :alt="alt"
    :width="width"
    loading="lazy"
    class="block size-full object-cover"
  />
  <div
    v-else
    role="img"
    :aria-label="alt"
    class="flex size-full items-center justify-center bg-[repeating-linear-gradient(135deg,#1C1C20_0_12px,#18181B_12px_24px)] p-4 text-center text-xs text-dim"
  >
    {{ alt }}
  </div>
</template>
