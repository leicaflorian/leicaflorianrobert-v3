<!-- The black-and-white photo in the grey frame of legacy mode. -->
<script setup lang="ts">
defineProps<{ caption?: string }>()
</script>

<template>
  <div class="border-2 border-black bg-legacy-frame p-[5px]">
    <img src="/imgs/me-transparent.webp" alt="Leica Florian Robert" class="block w-full contrast-120 grayscale">
    <p v-if="caption" class="m-0 mt-1.5 text-center text-[13px]">{{ caption }}</p>
  </div>
</template>
