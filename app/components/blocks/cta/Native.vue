<!--
  The invitation to write: a centered banner ("Ora sai qualcosa in più, scrivimi"),
  or title on the left and buttons on the right (the end of a case study).
-->
<script setup lang="ts">
import type {BlockCta} from '~/types/content'

defineProps<{
  block: BlockCta
  /** The label with its number. */
  label?: string
}>()
</script>

<template>
  <section v-if="block.variant === 'banner'" class="border-t border-line bg-bg-alt">
    <div class="page section-y flex flex-col items-center text-center">
      <h2 class="m-0 max-w-[800px] text-balance text-[clamp(32px,5vw,60px)] font-extrabold leading-[1.05] tracking-[-0.04em]">
        {{ block.title }} <span v-if="block.title_accent" class="text-accent">{{ block.title_accent }}</span>
        <UiBlinkCursor/>
      </h2>
      <p v-if="block.text" class="m-0 mt-7 max-w-[600px] text-[15px] leading-[1.8] text-muted">{{ block.text }}</p>
      <UiButton to="contact" glow class="mt-11 px-[26px]">{{ $t('common.contactMe') }}</UiButton>
    </div>
  </section>

  <section v-else class="border-t border-line bg-bg-alt">
    <div class="page flex flex-wrap items-center justify-between gap-8 py-40 max-[860px]:py-24">
      <div>
        <p v-if="label" class="m-0 mb-3 text-[13px] text-subtle">{{ label }}</p>
        <UiSectionTitle>
          {{ block.title }} <span v-if="block.title_accent" class="text-accent">{{ block.title_accent }}</span>
        </UiSectionTitle>
        <p v-if="block.text" class="m-0 mt-5 max-w-[560px] text-[15px] leading-[1.8] text-muted">{{ block.text }}</p>
      </div>
      <div class="flex flex-wrap gap-3">
        <UiButton to="contact">{{ $t('common.contactMe') }}</UiButton>
        <UiButton to="projects" variant="secondary">{{ $t('common.allProjects') }}</UiButton>
      </div>
    </div>
  </section>
</template>
