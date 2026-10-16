<!-- The "Parliamone" section: title, optional text and form, with the project.json beside it. -->
<script setup lang="ts">
import type {BlockContactForm} from '~/types/content'

defineProps<{
  block: BlockContactForm
  /** The label with its number. */
  label?: string
}>()
</script>

<template>
  <section id="contact-form" class="scroll-mt-16 border-t border-line bg-bg-alt">
    <div class="page section-y grid grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-start gap-18 max-[860px]:grid-cols-1">
      <div>
        <UiSectionLabel v-if="label">{{ label }}</UiSectionLabel>
        <UiSectionTitle class="mb-4">{{ block.title }}</UiSectionTitle>
        <p v-if="block.text" class="m-0 max-w-[520px] text-[15px] leading-[1.8] text-muted">{{ block.text }}</p>
        <ContactForm class="mt-11"/>
      </div>
      <ContactBrief/>
    </div>
  </section>
</template>
