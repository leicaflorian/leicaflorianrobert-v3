<!-- Who the project was for: client work stands out, personal projects stay quiet. -->
<script setup lang="ts">
import type {ProjectKind} from '~/types/content'

defineProps<{kind: ProjectKind}>()
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px]"
    :class="kind === 'personal' ? 'border-line-control text-subtle' : 'border-accent/40 text-accent'"
  >{{ $t(`projects.kind.${kind}`) }}</span>
</template>
