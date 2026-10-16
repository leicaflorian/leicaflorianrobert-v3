<!-- The "Parliamone" section: title, optional text and form, with project.json and the steps beside it. -->
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
        <p v-if="block.text" class="m-0 max-w-[520px] font-sans text-base leading-[1.7] text-muted">{{ block.text }}</p>
        <ContactForm class="mt-11"/>
      </div>
      <div class="sticky top-24 flex min-w-0 flex-col gap-10 max-[860px]:static">
        <ContactBrief/>
        <div v-if="block.steps">
          <h3 v-if="block.steps_title" class="m-0 mb-5 text-lg font-bold text-ink">{{ block.steps_title }}</h3>
          <ol class="m-0 flex list-none flex-col gap-4 p-0 font-sans text-[15px] leading-[1.6] text-muted">
            <li v-for="(step, i) in lines(block.steps)" :key="i" class="flex gap-4">
              <span class="shrink-0 font-mono text-[13px] leading-[1.85] text-accent">{{ String(i + 1).padStart(2, '0') }}</span>
              <span>{{ step }}</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  </section>
</template>
