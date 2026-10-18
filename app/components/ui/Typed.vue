<!-- A title typed in as it comes into view (useTypewriter), with the cursor blinking at the end. -->
<script setup lang="ts">
withDefaults(defineProps<{as?: string}>(), {as: 'h2'})

const host = useTemplateRef<HTMLElement>('host')
const cursor = useTemplateRef<{$el: HTMLElement}>('cursor')
const caret = useTypewriter(host, () => cursor.value?.$el)
</script>

<template>
  <component :is="as" ref="host" class="relative">
    <slot/>
    <UiBlinkCursor ref="cursor" :class="{invisible: caret}"/>
    <span
      v-if="caret"
      aria-hidden="true"
      class="absolute ml-[0.1em] h-[0.09em] w-[0.5em] bg-accent"
      :style="{left: `${caret.x}px`, top: `${caret.y}px`}"
    />
  </component>
</template>
