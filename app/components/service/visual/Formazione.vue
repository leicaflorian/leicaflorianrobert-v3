<!-- Training: a line of code, highlighted (it glows) and explained in a floating note. -->
<template>
  <div class="relative flex h-full flex-col gap-1.5 bg-bg-deep py-[22px] text-xs leading-[1.4]">
    <div class="grid grid-cols-[40px_1fr] text-subtle"><span class="pr-3.5 text-right text-gutter">1</span><span>{{ $t('services.visual.why') }}</span></div>
    <div class="grid grid-cols-[40px_1fr]"><span class="pr-3.5 text-right text-gutter">2</span><span><span class="text-code-keyword">const</span> total = items</span></div>
    <div class="grid grid-cols-[40px_1fr] border-l-2 border-accent bg-code-line motion-safe:animate-[glow-line_2.4s_ease-in-out_infinite]"><span class="pr-3 text-right text-accent">3</span><span class="whitespace-pre">  .reduce((a, i) => a + i.price, 0)</span></div>
    <div class="grid grid-cols-[40px_1fr]"><span class="pr-3.5 text-right text-gutter">4</span><span class="whitespace-pre text-subtle">  ;</span></div>
    <div class="absolute bottom-5 right-5 max-w-[170px] rounded-lg border border-line-control bg-surface px-[11px] py-[9px] text-[10px] leading-normal text-ink-soft motion-safe:animate-[bob_3s_ease-in-out_infinite]">
      <span class="text-accent">a</span> {{ $t('services.visual.explain') }}
    </div>
  </div>
</template>
