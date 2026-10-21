<!-- An arrow (→, ←, ↗ or ↓), sharper than the font's at small sizes; takes the text colour. -->
<script setup lang="ts">
withDefaults(defineProps<{direction?: 'right' | 'left' | 'up-right' | 'down'}>(), {direction: 'right'})

const PATHS = {
  'right': 'M2.5 8h11m-4.5-4.5L13.5 8 9 12.5',
  'left': 'M13.5 8h-11M7 3.5 2.5 8 7 12.5',
  'up-right': 'M4.5 11.5l7-7m-6 0h6v6',
  'down': 'M8 2.5v11m-4.5-4.5L8 13.5 12.5 9',
}
</script>

<template>
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path :d="PATHS[direction]"/>
  </svg>
</template>
