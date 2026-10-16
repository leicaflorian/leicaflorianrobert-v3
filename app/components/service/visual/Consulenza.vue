<!-- Technical consulting: a diff written line by line, with a review comment floating below. -->
<template>
  <div class="relative flex h-full flex-col gap-0.5 bg-bg-deep py-[22px] text-xs leading-[1.7]">
    <div class="px-5 text-subtle">src/api/orders.js</div>
    <div class="bg-diff-del-bg px-5 text-diff-del motion-safe:animate-[step-in_4s_ease-out_infinite]">- fetch(url).then(r => r.json())</div>
    <div class="bg-diff-add-bg px-5 text-diff-add motion-safe:animate-[step-in_4s_ease-out_.6s_infinite]">+ await api.get(url, { retry: 3 })</div>
    <div class="absolute inset-x-5 bottom-5 flex items-start gap-2.5 rounded-lg border border-line-control bg-surface px-3 py-2.5 motion-safe:animate-[bob_3s_ease-in-out_infinite]">
      <span class="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-[9px] font-extrabold text-bg">lfr</span>
      <span class="text-[11px] leading-normal text-ink-soft">{{ $t('services.visual.review') }}</span>
    </div>
  </div>
</template>
