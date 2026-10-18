<!--
  A client area, like an online bank's, drawn in code for a project that can't be shown:
  sidebar, portfolio balance and trend, allocation, movements. Text is drawn as bars and the
  figures are made up, so nothing identifies the real product. Sized in the cover's
  container query units, inside its browser window.
-->
<template>
  <div aria-hidden="true" class="grid aspect-16/10 grid-cols-[13%_1fr] bg-bg">
    <div class="flex flex-col gap-[1.6cqw] border-r border-line-control bg-surface px-[1.6cqw] py-[2.4cqw]">
      <span class="mb-[1cqw] size-[2.6cqw] rounded-[0.7cqw] bg-gutter"/>
      <span v-for="item in 4" :key="item" class="flex items-center gap-[0.8cqw]">
        <i class="size-[1.4cqw] flex-none rounded-[0.4cqw]" :class="item === 1 ? 'bg-accent' : 'bg-gutter'"/>
        <b class="h-[0.8cqw] flex-1 rounded-full" :class="item === 1 ? 'bg-muted/60' : 'bg-line-control'"/>
      </span>
    </div>

    <div class="grid grid-cols-[1.7fr_1fr] grid-rows-[auto_1fr] gap-[1.6cqw] px-[2.6cqw] py-[2.4cqw]">
      <div class="rounded-[1cqw] border border-line-card bg-surface p-[1.6cqw]">
        <span class="block h-[0.8cqw] w-[30%] rounded-full bg-line-control"/>
        <p class="m-0 mt-[1cqw] text-[3.2cqw] font-extrabold tracking-[-0.02em] text-ink">€ 128.450<small class="text-[0.5em] font-medium text-muted">,00</small></p>
        <p class="m-0 mt-[0.6cqw] text-[1.2cqw] text-code-string">▲ 4,2%</p>
        <svg viewBox="0 0 300 80" preserveAspectRatio="none" class="mt-[1.2cqw] block h-auto w-full text-accent">
          <defs>
            <linearGradient id="banking-trend" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stop-color="currentColor" stop-opacity="0.35"/>
              <stop offset="1" stop-color="currentColor" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <path :d="`${trend} L300 80 L0 80 Z`" fill="url(#banking-trend)"/>
          <path :d="trend" fill="none" stroke="currentColor" stroke-width="2.5" vector-effect="non-scaling-stroke"/>
        </svg>
      </div>

      <div class="rounded-[1cqw] border border-line-card bg-surface p-[1.6cqw]">
        <span class="block h-[0.8cqw] w-[30%] rounded-full bg-line-control"/>
        <div class="mt-[1.4cqw] flex items-center gap-[1.4cqw]">
          <svg viewBox="0 0 42 42" class="w-[9cqw] flex-none">
            <circle cx="21" cy="21" r="15.9" fill="none" stroke-width="6" class="stroke-line-control"/>
            <circle v-for="slice in slices" :key="slice.class" cx="21" cy="21" r="15.9" fill="none" stroke-width="6" :class="slice.class" :stroke-dasharray="`${slice.size} ${100 - slice.size}`" :stroke-dashoffset="slice.offset"/>
          </svg>
          <div class="grid flex-1 gap-[0.9cqw]">
            <span v-for="slice in slices" :key="slice.class" class="flex items-center gap-[0.6cqw]">
              <i class="size-[0.9cqw] flex-none rounded-full" :class="slice.dot"/>
              <b class="h-[0.7cqw] flex-1 rounded-full bg-line-control"/>
            </span>
          </div>
        </div>
      </div>

      <div class="col-span-full grid gap-[1cqw] rounded-[1cqw] border border-line-card bg-surface p-[1.6cqw]">
        <span v-for="move in moves" :key="move.amount" class="flex items-center gap-[1.2cqw]">
          <i class="size-[2.2cqw] flex-none rounded-full bg-surface-hover"/>
          <b class="h-[0.8cqw] rounded-full bg-line-control" :style="{width: move.label}"/>
          <span class="ml-auto text-[1.2cqw]" :class="move.amount.startsWith('+') ? 'text-code-string' : 'text-muted'">{{ move.amount }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const trend = 'M0 62 L25 58 L50 64 L75 50 L100 54 L125 40 L150 44 L175 32 L200 36 L225 22 L250 26 L275 14 L300 10'
const slices = [
  {class: 'stroke-accent', dot: 'bg-accent', size: 48, offset: 25},
  {class: 'stroke-accent-light', dot: 'bg-accent-light', size: 28, offset: 77},
  {class: 'stroke-muted', dot: 'bg-muted', size: 16, offset: 49},
]
const moves = [
  {label: '22%', amount: '+ € 2.500'},
  {label: '30%', amount: '+ € 340'},
  {label: '18%', amount: '− € 1.200'},
]
</script>
