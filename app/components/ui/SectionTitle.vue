<!-- Section title, typed in, with the cursor blinking at the end. -->
<script setup lang="ts">
withDefaults(defineProps<{
  as?: string
  size?: 'section' | 'sub'
}>(), {as: 'h2', size: 'section'})
</script>

<template>
  <UiTyped
    :as="as"
    class="m-0 font-extrabold tracking-[-0.03em]"
    :class="size === 'section' ? 'text-[clamp(28px,4vw,44px)] leading-[1.05]' : 'text-[clamp(26px,3.4vw,38px)] leading-[1.1]'"
  >
    <slot/>
  </UiTyped>
</template>
