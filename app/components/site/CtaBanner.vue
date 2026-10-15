<!-- "Ora sai qualcosa in più, scrivimi" (now you know more, write to me): the closing of About and Projects. -->
<script setup lang="ts">
defineProps<{ text: string }>()
</script>

<template>
  <section class="border-t border-line bg-bg-alt">
    <div class="page section-y flex flex-col items-center text-center">
      <h2 class="m-0 max-w-[800px] text-balance text-[clamp(32px,5vw,60px)] font-extrabold leading-[1.05] tracking-[-0.04em]">
        {{ $t('cta.title') }} <span class="text-accent">{{ $t('cta.accent') }}</span>
        <UiBlinkCursor/>
      </h2>
      <p class="m-0 mt-7 max-w-[600px] text-[15px] leading-[1.8] text-muted">{{ text }}</p>
      <UiButton to="contact" glow class="mt-11 px-[26px]">{{ $t('common.contactMe') }}</UiButton>
    </div>
  </section>
</template>
