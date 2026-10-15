<!-- A case study section: label and title on the left, the story on the right. -->
<script setup lang="ts">
defineProps<{
  label: string
  title: string
}>()
</script>

<template>
  <section class="border-t border-line">
    <div class="page grid grid-cols-[minmax(0,0.35fr)_minmax(0,0.65fr)] items-start gap-18 py-40 max-[860px]:grid-cols-1 max-[860px]:gap-8 max-[860px]:py-24">
      <div>
        <UiSectionLabel>{{ label }}</UiSectionLabel>
        <UiSectionTitle size="sub">{{ title }}</UiSectionTitle>
      </div>
      <div class="flex flex-col gap-5 text-base leading-[1.85] text-ink-soft">
        <slot/>
      </div>
    </div>
  </section>
</template>
