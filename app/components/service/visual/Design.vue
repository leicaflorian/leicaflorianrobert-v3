<!--
  UI/UX design: a selected button on its guides, with its size. A pointer visits the four
  handles, each grows under it; on hover the button grows.
-->
<script setup lang="ts">
/** The handles, in the order the pointer visits them; the delay matches its stop. */
const corners = [
  {at: 'left-[calc(30%-3px)] top-[calc(46%-25px)]', delay: '0s'},
  {at: 'right-[calc(30%-4px)] top-[calc(46%-25px)]', delay: '1.6s'},
  {at: 'right-[calc(30%-4px)] top-[calc(46%+19px)]', delay: '3.2s'},
  {at: 'left-[calc(30%-3px)] top-[calc(46%+19px)]', delay: '4.8s'},
]
</script>

<template>
  <div class="relative h-full overflow-hidden bg-bg">
    <div class="absolute inset-y-0 left-[30%] border-l border-dashed border-guide"/>
    <div class="absolute inset-y-0 right-[30%] border-l border-dashed border-guide"/>
    <div class="absolute inset-x-0 top-[46%] border-t border-dashed border-guide"/>
    <div class="absolute inset-x-[30%] top-[calc(46%-22px)] flex h-11 items-center justify-center rounded-lg border border-accent bg-surface-raised text-[11px] text-ink transition-[scale] duration-500 ease-spring group-hover:scale-105">
      {{ $t('services.visual.start') }}<UiArrowIcon class="ml-1.5 size-2.5"/>
    </div>
    <span
      v-for="{at, delay} in corners"
      :key="at"
      :class="at"
      :style="{animationDelay: delay}"
      class="absolute size-1.5 border border-accent bg-bg motion-safe:animate-[handle-hover_8s_ease-in-out_infinite]"
    />
    <svg
      class="absolute left-1/2 top-[88%] z-10 h-4 w-3 drop-shadow-[0_2px_4px_rgb(0_0_0/0.6)] motion-safe:animate-[pointer-tour_8s_ease-in-out_infinite] motion-reduce:hidden"
      viewBox="0 0 12 16"
    >
      <path d="M1 1v12.5l3.2-3.1 2.1 4.6 2-.9-2.1-4.5H10z" class="fill-ink stroke-bg" stroke-width="1"/>
    </svg>
    <span class="absolute left-1/2 top-[calc(46%+34px)] -translate-x-1/2 rounded bg-accent px-[7px] py-[3px] text-[10px] font-bold text-bg">240 × 44</span>
  </div>
</template>
