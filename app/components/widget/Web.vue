<!--
  How the web works, in a terminal: a request goes from the browser through DNS to the
  server and comes back 200 OK, then the response headers light up.
-->
<script setup lang="ts">
const root = useTemplateRef<HTMLElement>('root')

const HOPS = ['browser', 'DNS', 'server', '200 OK']
const hop = ref(0)

useVisibleInterval(root, () => {
  hop.value = (hop.value + 1) % HOPS.length
}, 1400)

/** The response: the status shows once the server is reached, the headers when it is back. */
const shown = (line: number) => hop.value === 3 || (line === 0 && hop.value >= 2)
</script>

<template>
  <div ref="root" class="flex h-[340px] min-w-0 flex-col overflow-hidden rounded-2xl border border-line-card bg-bg-deep text-xs leading-[1.7]" aria-hidden="true">
    <div class="flex items-center justify-between gap-3 border-b border-line bg-surface px-4 py-3 text-subtle">
      <span class="flex items-center gap-1.5">
        <span v-for="i in 3" :key="i" class="size-[9px] rounded-full bg-gutter"/>
        <span class="ml-2">zsh · {{ $t('widgets.web.title') }}</span>
      </span>
      <span class="text-accent">HTTP/2</span>
    </div>
    <div class="grid grid-cols-4 gap-1.5 px-5 pt-[18px] text-center text-[10px]">
      <span
        v-for="(label, i) in HOPS"
        :key="label"
        class="rounded-md border px-1 py-2 transition-colors duration-300"
        :class="[i === hop ? 'border-accent bg-accent/12' : 'border-line-card', i <= hop ? 'text-ink' : 'text-ghost']"
      >{{ label }}</span>
    </div>
    <div class="flex flex-col gap-px px-5 py-4">
      <span class="text-subtle"><span class="text-code-ok">$</span> <span class="text-ink">curl -I https://leicaflorianrobert.dev</span></span>
      <span class="text-code-ok transition-opacity duration-300" :class="shown(0) ? 'opacity-100' : 'opacity-15'">HTTP/2 200</span>
      <span class="truncate text-ink-soft transition-opacity duration-300" :class="shown(1) ? 'opacity-100' : 'opacity-15'">content-type: text/html; charset=utf-8</span>
      <span class="truncate text-ink-soft transition-opacity duration-300" :class="shown(2) ? 'opacity-100' : 'opacity-15'">cache-control: max-age=3600</span>
      <span class="truncate text-ink-soft transition-opacity duration-300" :class="shown(3) ? 'opacity-100' : 'opacity-15'">content-encoding: br</span>
      <span class="truncate text-code-keyword transition-opacity duration-300" :class="shown(4) ? 'opacity-100' : 'opacity-15'">x-powered-by: {{ $t('widgets.web.poweredBy') }}</span>
    </div>
  </div>
</template>
