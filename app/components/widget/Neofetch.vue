<!-- `neofetch` in the terminal: the setup, with seven colour themes to pick from. -->
<script setup lang="ts">
const {t} = useI18n()

/** The themes are the widget's own palettes, not the site's: their colours stay here. */
const THEMES = [
  {name: 'default', swatch: '#111113', bg: '#0C0C0E', text: '#BDBAB2', dim: '#5A5852', accent: '#FF5B14', key: '#FF8A57', prompt: '#5BD48A', rule: '#3A3A40'},
  {name: 'graphite', swatch: '#2C2C31', bg: '#2C2C31', text: '#EDEBE6', dim: '#8F8C85', accent: '#FF8A57', key: '#FFB08A', prompt: '#5BD48A', rule: '#4A4A50'},
  {name: 'ash', swatch: '#8F8C85', bg: '#8F8C85', text: '#111113', dim: '#3A3A40', accent: '#111113', key: '#2C1A10', prompt: '#111113', rule: '#5A5852'},
  {name: 'paper', swatch: '#EDEBE6', bg: '#EDEBE6', text: '#2C2C31', dim: '#8F8C85', accent: '#E04A0A', key: '#B33A06', prompt: '#2E9E5B', rule: '#C9C6BE'},
  {name: 'lfr', swatch: '#FF5B14', bg: '#FF5B14', text: '#111113', dim: '#5C2A14', accent: '#111113', key: '#111113', prompt: '#111113', rule: '#A33F12'},
  {name: 'matrix', swatch: '#5BD48A', bg: '#07110B', text: '#9FE6BA', dim: '#2F6B47', accent: '#5BD48A', key: '#7FE0A4', prompt: '#5BD48A', rule: '#1E3A29'},
  {name: 'amber', swatch: '#E8B04A', bg: '#120D05', text: '#F0CB85', dim: '#7A5B22', accent: '#E8B04A', key: '#F2C46E', prompt: '#E8B04A', rule: '#3D2E12'},
]

const LOGO = [
  ' _  __      ',
  '| |/ _|_ __ ',
  '| | |_| \'__|',
  '| |  _| |   ',
  '|_|_| |_|   ',
].join('\n')

const theme = ref(THEMES[0]!)

const info = computed(() => [
  ['OS', 'macOS 15'],
  ['Editor', 'PhpStorm'],
  ['Shell', 'zsh'],
  ['Terminal', 'Warp'],
  ['Font', 'JetBrains Mono'],
  ['Theme', theme.value.name],
  [t('widgets.neofetch.coffee'), t('widgets.neofetch.perDay')],
])
</script>

<template>
  <div
    class="flex h-[340px] min-w-0 flex-col gap-3.5 overflow-hidden rounded-2xl border border-line-card p-[22px] text-[11px] leading-[1.55] transition-colors duration-300"
    :style="{background: theme.bg}"
  >
    <span :style="{color: theme.dim}"><span :style="{color: theme.prompt}">$</span> neofetch</span>
    <div class="flex flex-wrap items-start gap-x-[18px] gap-y-3">
      <pre class="m-0 font-mono text-[10px] leading-[1.15] [font-variant-ligatures:none]" :style="{color: theme.accent}" aria-hidden="true">{{ LOGO }}</pre>
      <div class="flex min-w-0 flex-[1_1_160px] flex-col gap-px">
        <span :style="{color: theme.text}"><span :style="{color: theme.accent}">leica</span>@<span :style="{color: theme.accent}">studio</span></span>
        <span :style="{color: theme.rule}" aria-hidden="true">-------------</span>
        <span v-for="[key, value] in info" :key="key" class="truncate">
          <span :style="{color: theme.key}">{{ key }}</span><span :style="{color: theme.dim}">: </span><span :style="{color: theme.text}">{{ value }}</span>
        </span>
      </div>
    </div>
    <div class="mt-auto flex items-center gap-1">
      <button
        v-for="option in THEMES"
        :key="option.name"
        type="button"
        :title="option.name"
        :aria-label="$t('widgets.neofetch.theme', {name: option.name})"
        :aria-pressed="option.name === theme.name"
        class="h-3.5 w-6 cursor-pointer border p-0 transition-[translate] duration-150 hover:-translate-y-0.5"
        :class="option.name === theme.name ? '-translate-y-[3px]' : ''"
        :style="{background: option.swatch, borderColor: option.name === theme.name ? theme.text : 'rgb(128 128 128 / 0.35)'}"
        @click="theme = option"
      />
      <span class="ml-auto whitespace-nowrap pl-2 text-[10px]" :style="{color: theme.dim}">theme: {{ theme.name }}</span>
    </div>
  </div>
</template>
