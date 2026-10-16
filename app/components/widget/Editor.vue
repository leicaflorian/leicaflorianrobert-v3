<!-- An editor that types code by itself: two tabs, the file tree and the status bar. -->
<script setup lang="ts">
type Tab = 'vue' | 'ts'
type Tone = 'keyword' | 'text' | 'comment'

const {t} = useI18n()
const root = useTemplateRef<HTMLElement>('root')

const TABS: {id: Tab, name: string, lang: string}[] = [
  {id: 'vue', name: 'Checkout.vue', lang: 'Vue'},
  {id: 'ts', name: 'api.ts', lang: 'TypeScript'},
]

/** The lines already written, and the one being typed. `todo` is the translated comment. */
const CODE: Record<Tab, {lines: [string, Tone][], typing: string}> = {
  vue: {
    lines: [['<script setup>', 'keyword'], ['const cart = useCart()', 'text'], ['', 'text'], ['async function checkout() {', 'keyword'], ['  loading.value = true', 'text'], ['todo', 'comment']],
    typing: '  await pay(cart.total)',
  },
  ts: {
    lines: [['export async function pay(', 'keyword'], ['  amount: number', 'text'], ['): Promise<Order> {', 'keyword'], ['  const res = await fetch(\'/api/pay\',', 'text'], ['    { method: \'POST\', body: amount })', 'text'], ['  if (!res.ok) throw new Error(\'KO\')', 'comment']],
    typing: '  return res.json()',
  },
}

const TREE: Record<Tab, [string, number, boolean][]> = {
  vue: [['▸ api', 1, false], ['▾ pages', 1, false], ['Checkout.vue', 2, true], ['Home.vue', 2, false], ['▸ stores', 1, false]],
  ts: [['▾ api', 1, false], ['api.ts', 2, true], ['▸ pages', 1, false], ['▸ stores', 1, false]],
}

const TONES: Record<Tone, string> = {keyword: 'text-code-keyword', text: 'text-ink', comment: 'text-subtle'}

const tab = ref<Tab>('vue')
const typed = ref(0)

const code = computed(() => CODE[tab.value].lines.map(([text, tone]) => ({
  text: text === 'todo' ? t('widgets.editor.todo') : text,
  tone: TONES[tone],
})))
const typing = computed(() => CODE[tab.value].typing.slice(0, typed.value))
const lang = computed(() => TABS.find(({id}) => id === tab.value)!.lang)

function open(id: Tab) {
  tab.value = id
  typed.value = 0
}

// one character at a time, then a pause, then again from the start
useVisibleInterval(root, () => {
  typed.value = typed.value >= CODE[tab.value].typing.length + 14 ? 0 : typed.value + 1
}, 110)
</script>

<template>
  <div ref="root" class="flex h-[340px] min-w-0 flex-col overflow-hidden rounded-2xl border border-line-card bg-bg-deep text-xs">
    <div class="flex border-b border-line bg-surface text-[11px] text-subtle">
      <button
        v-for="{id, name} in TABS"
        :key="id"
        type="button"
        class="cursor-pointer border-0 border-r border-t-2 border-r-line px-3.5 pb-[9px] pt-[7px] font-mono text-[11px] hover:text-ink"
        :class="id === tab ? 'border-t-accent bg-bg-deep text-ink' : 'border-t-transparent bg-transparent text-subtle'"
        @click="open(id)"
      >
        {{ name }}
      </button>
    </div>
    <div class="grid min-h-0 flex-1 grid-cols-[minmax(0,92px)_minmax(0,1fr)]">
      <div class="flex flex-col gap-1 overflow-hidden whitespace-nowrap border-r border-line px-2 py-2.5 text-[10px] text-subtle">
        <span>▾ src</span>
        <span
          v-for="[name, depth, current] in TREE[tab]"
          :key="name"
          :class="current ? 'text-accent' : ''"
          :style="{paddingLeft: `${depth * 10}px`}"
        >{{ name }}</span>
      </div>
      <div class="flex min-w-0 flex-col gap-px overflow-hidden py-2.5 text-[11px] leading-[1.55]" aria-hidden="true">
        <div v-for="(line, i) in code" :key="`${tab}-${i}`" class="grid grid-cols-[26px_1fr]">
          <span class="pr-2 text-right text-gutter">{{ i + 1 }}</span>
          <span class="whitespace-pre" :class="line.tone">{{ line.text }}</span>
        </div>
        <div class="grid grid-cols-[26px_1fr] bg-code-line">
          <span class="pr-2 text-right text-accent">{{ code.length + 1 }}</span>
          <span class="whitespace-pre text-ink">{{ typing }}<span class="animate-cursor text-accent">▍</span></span>
        </div>
      </div>
    </div>
    <div class="flex justify-between bg-accent px-3 py-1.5 text-[10px] font-bold text-bg">
      <span>⎇ main · {{ $t('widgets.editor.changes') }}</span>
      <span>{{ lang }} · UTF-8</span>
    </div>
  </div>
</template>
