<!-- The large title at the top of a page, typed in. -->
<script setup lang="ts">
withDefaults(defineProps<{
  size?: 'xl' | 'lg'
}>(), {size: 'xl'})
</script>

<template>
  <UiTyped
    as="h1"
    class="m-0 font-extrabold text-balance text-ink"
    :class="size === 'xl'
      ? 'text-[clamp(44px,7vw,96px)] leading-[0.95] tracking-[-0.05em]'
      : 'text-[clamp(36px,5.4vw,72px)] leading-none tracking-[-0.04em]'"
  >
    <slot/>
  </UiTyped>
</template>
