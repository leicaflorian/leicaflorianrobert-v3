<!-- A block laid out in two columns: label and title on the left, the content on the right. -->
<script setup lang="ts">
defineProps<{
  label?: string | null
  title?: string | null
}>()
</script>

<template>
  <section class="border-t border-line">
    <div class="page grid grid-cols-[minmax(0,0.35fr)_minmax(0,0.65fr)] items-start gap-18 py-40 max-[860px]:grid-cols-1 max-[860px]:gap-8 max-[860px]:py-24">
      <div class="sticky top-24 max-[860px]:static">
        <UiSectionLabel v-if="label">{{ label }}</UiSectionLabel>
        <UiSectionTitle v-if="title" size="sub">{{ title }}</UiSectionTitle>
      </div>
      <div class="flex flex-col gap-5 text-base leading-[1.85] text-ink-soft">
        <slot/>
      </div>
    </div>
  </section>
</template>
