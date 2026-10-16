<!-- DevOps: a pipeline in the terminal, its steps appearing one by one while the deploy runs. -->
<template>
  <div class="flex h-full flex-col gap-[7px] bg-bg-deep px-6 py-[22px] text-xs leading-[1.4] whitespace-pre">
    <span class="text-subtle motion-safe:animate-[step-in_4s_ease-out_infinite]">$ <span class="text-ink">git push origin main</span></span>
    <span class="text-ink-soft motion-safe:animate-[step-in_4s_ease-out_.4s_infinite]"><span class="text-code-ok">✓</span> build       38s</span>
    <span class="text-ink-soft motion-safe:animate-[step-in_4s_ease-out_.8s_infinite]"><span class="text-code-ok">✓</span> test        124 passed</span>
    <span class="text-ink-soft motion-safe:animate-[step-in_4s_ease-out_1.2s_infinite]"><span class="text-accent">→</span> deploy prod<span class="animate-cursor text-accent">_</span></span>
    <div class="mt-auto h-1 overflow-hidden rounded bg-surface-hover">
      <div class="h-full w-[86%] animate-[bar-fill_4s_ease-out_infinite] bg-accent"/>
    </div>
  </div>
</template>
