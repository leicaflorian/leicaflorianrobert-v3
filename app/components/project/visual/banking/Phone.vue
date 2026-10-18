<!--
  The mobile app next to the client area: a purchase screen drawn as bars, with a made-up
  amount and the buy button. The cover positions it (absolute, over its browser window's bottom
  right corner), which the notch is placed against.
-->
<template>
  <div aria-hidden="true" class="flex aspect-9/18.5 w-[17cqw] flex-col gap-[1.2cqw] rounded-[2.6cqw] border-[0.6cqw] border-[#232327] bg-bg px-[1.4cqw] py-[2.2cqw] shadow-[0_2cqw_6cqw_rgb(0_0_0/0.6)]">
    <span class="absolute left-1/2 top-[0.8cqw] h-[1cqw] w-[30%] -translate-x-1/2 rounded-full bg-[#232327]"/>
    <span class="block h-[0.8cqw] w-1/2 rounded-full bg-line-control"/>
    <p class="m-0 mt-[1.4cqw] text-[2.2cqw] font-extrabold text-ink">€ 5.000</p>
    <span v-for="tile in tiles" :key="tile" class="grid gap-[0.7cqw] rounded-[0.9cqw] border border-line-card bg-surface p-[1cqw]">
      <b class="h-[0.6cqw] rounded-full bg-line-control" :style="{width: tile}"/>
      <b class="h-[0.6cqw] w-[40%] rounded-full bg-line-control"/>
    </span>
    <span class="mt-auto flex h-[3cqw] items-center justify-center rounded-full bg-accent">
      <b class="h-[0.6cqw] w-[40%] rounded-full bg-ink/80"/>
    </span>
  </div>
</template>

<script setup lang="ts">
const tiles = ['70%', '60%']
</script>
