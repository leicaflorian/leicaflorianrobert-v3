<!-- The "Parliamone" section: title, optional text and form, with an image beside it. -->
<script setup lang="ts">
import type {BlockContactForm} from '~/types/content'

defineProps<{
  block: BlockContactForm
  /** The label with its number. */
  label?: string
}>()
</script>

<template>
  <section class="border-t border-line bg-bg-alt">
    <div class="page section-y grid grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-center gap-18 max-[860px]:grid-cols-1">
      <div>
        <UiSectionLabel v-if="label">{{ label }}</UiSectionLabel>
        <UiSectionTitle class="mb-4">{{ block.title }}</UiSectionTitle>
        <p v-if="block.text" class="m-0 max-w-[520px] text-[15px] leading-[1.8] text-muted">{{ block.text }}</p>
        <ContactForm class="mt-11"/>
      </div>
      <div class="aspect-4/5 overflow-hidden rounded-2xl max-[860px]:aspect-video">
        <UiMediaImage :id="block.image" :alt="$t('contact.contactImage')" :width="900"/>
      </div>
    </div>
  </section>
</template>
