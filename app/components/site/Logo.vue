<!-- The logo: "lfr" with the cursor, like a terminal command. -->
<script setup lang="ts">
withDefaults(defineProps<{ size?: 'md' | 'lg' }>(), {size: 'md'})
</script>

<template>
  <span
    aria-label="lfr"
    class="inline-flex shrink-0 items-center justify-center gap-0.5 border border-line-control bg-surface-raised font-extrabold leading-none tracking-[-0.06em] text-accent"
    :class="size === 'lg' ? 'size-11 rounded-[11px] text-[15px]' : 'size-10 rounded-[10px] text-sm'"
  >lfr<span
    class="inline-block h-0.5 w-1.5 animate-cursor self-end bg-accent"
    :class="size === 'lg' ? 'mb-[13px]' : 'mb-3'"
  /></span>
</template>
