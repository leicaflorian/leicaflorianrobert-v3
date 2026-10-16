<!-- Mobile: the top of a phone where a push notification keeps arriving; on hover the phone rises. -->
<template>
  <div class="flex h-full items-end justify-center overflow-hidden bg-bg bg-[radial-gradient(var(--color-line-card)_1px,transparent_1px)] bg-size-[16px_16px]">
    <div class="flex h-[176px] w-[130px] translate-y-1 flex-col gap-2 rounded-t-3xl border-6 border-b-0 border-line-control bg-surface px-2.5 pt-[18px] transition-[translate] duration-500 ease-spring group-hover:-translate-y-1">
      <div class="mb-1.5 h-1 w-9 self-center rounded bg-line-control"/>
      <div class="flex flex-col gap-1 rounded-lg bg-surface-hover p-2 motion-safe:animate-[notify-drop_4s_ease-out_infinite]">
        <span class="text-[9px] text-accent">{{ $t('services.visual.push') }}</span>
        <span class="text-[10px] text-ink">{{ $t('services.visual.shipped') }}</span>
      </div>
      <div class="flex flex-col gap-[5px] rounded-lg bg-surface-raised p-2">
        <div class="h-1.5 w-[70%] rounded-[3px] bg-line-control"/>
        <div class="h-1.5 w-[45%] rounded-[3px] bg-line-card"/>
      </div>
    </div>
  </div>
</template>
