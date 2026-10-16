<!-- Web: a checkout page in a browser window, loading; on hover the window rises and Pay grows. -->
<template>
  <div class="flex h-full items-center justify-center bg-bg bg-[radial-gradient(var(--color-line-card)_1px,transparent_1px)] bg-size-[16px_16px] p-6">
    <div class="w-full max-w-[260px] overflow-hidden rounded-[10px] border border-line-control bg-surface transition-[translate] duration-500 ease-spring group-hover:-translate-y-1.5">
      <div class="flex items-center gap-1.5 border-b border-line-card px-2.5 py-2">
        <span v-for="i in 3" :key="i" class="size-[7px] rounded-full bg-gutter"/>
        <span class="ml-1.5 flex-1 rounded-[5px] bg-bg px-2 py-[3px] text-[10px] text-subtle">lfr.dev/app/checkout</span>
      </div>
      <div class="flex flex-col gap-2 p-3.5">
        <div class="h-2 w-3/5 rounded-[3px] bg-[linear-gradient(90deg,var(--color-line-control),var(--color-gutter),var(--color-line-control))] bg-size-[200%_100%] motion-safe:animate-[skeleton-shimmer_2.4s_linear_infinite]"/>
        <div class="h-2 w-[85%] rounded-[3px] bg-[linear-gradient(90deg,var(--color-line-control),var(--color-gutter),var(--color-line-control))] bg-size-[200%_100%] motion-safe:animate-[skeleton-shimmer_2.4s_linear_infinite] [animation-delay:.3s]"/>
        <div class="mt-1.5 flex items-center justify-between">
          <span class="text-[11px] text-ink-soft">{{ $t('services.visual.price') }}</span>
          <span class="rounded-md bg-accent px-2.5 py-1.5 text-[10px] font-bold text-bg transition-[scale] duration-500 ease-spring group-hover:scale-110">{{ $t('services.visual.pay') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
