<!-- A text whose → characters become `UiArrowIcon`: the font's arrow renders poorly at small sizes. -->
<script setup lang="ts">
const props = defineProps<{text: string}>()

const parts = computed(() => props.text.split('→'))
</script>

<template>
  <span>
    <template v-for="(part, i) in parts" :key="i">
      <UiArrowIcon v-if="i" class="inline-block align-[-0.1em]"/>{{ part }}
    </template>
  </span>
</template>
