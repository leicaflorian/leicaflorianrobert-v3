<!-- A text whose arrows (→, ←, ↗) become `UiArrowIcon`: the font's arrows render poorly at small sizes. -->
<script setup lang="ts">
const props = defineProps<{text: string}>()

const DIRECTIONS = {'→': 'right', '←': 'left', '↗': 'up-right'} as const

// split() with a capturing group keeps the arrows, at the odd indexes
const parts = computed(() => props.text.split(/([→←↗])/))
</script>

<template>
  <span>
    <template v-for="(part, i) in parts" :key="i">
      <UiArrowIcon v-if="i % 2" :direction="DIRECTIONS[part as keyof typeof DIRECTIONS]" class="inline-block align-[-0.1em]"/>
      <template v-else>{{ part }}</template>
    </template>
  </span>
</template>
