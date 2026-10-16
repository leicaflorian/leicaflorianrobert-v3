<!-- AI & automation: a request in plain words, then the agent's steps appearing one by one. -->
<template>
  <div class="flex h-full flex-col gap-[7px] bg-bg-deep px-6 py-[22px] text-xs leading-[1.4] whitespace-pre">
    <span class="whitespace-normal text-subtle motion-safe:animate-[step-in_4s_ease-out_infinite]">&gt; <span class="text-ink">{{ $t('services.visual.aiPrompt') }}</span></span>
    <span class="text-ink-soft motion-safe:animate-[step-in_4s_ease-out_.5s_infinite]"><span class="text-accent">●</span> read   inbox        12</span>
    <span class="text-ink-soft motion-safe:animate-[step-in_4s_ease-out_1s_infinite]"><span class="text-accent">●</span> call   crm.update    3</span>
    <span class="text-ink-soft motion-safe:animate-[step-in_4s_ease-out_1.5s_infinite]"><span class="text-code-ok">✓</span> {{ $t('services.visual.aiDone') }}<span class="animate-cursor text-accent">_</span></span>
  </div>
</template>
