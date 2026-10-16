<!--
  The projects as `git log --graph`: one lane per branch (main, prod for clients, dev for
  personal projects), a commit per
  project with its hash, HEAD on the newest version of the site. Hovering a commit tells it
  in the status line; clicking opens it.
-->
<script setup lang="ts">
import type {Project, ProjectBranch} from '~/types/content'

const props = defineProps<{projects: Project[]}>()

const BRANCHES: ProjectBranch[] = ['main', 'client', 'lab']
const LINE: Record<ProjectBranch, string> = {main: 'bg-accent', client: 'bg-branch-client', lab: 'bg-branch-lab'}
const TEXT: Record<ProjectBranch, string> = {main: 'text-accent', client: 'text-branch-client', lab: 'text-branch-lab'}

const commits = computed(() => graphProjects(props.projects).map(project => ({project, branch: branchOf(project)})))
/** Each lane runs down to its last commit. */
const lastOf = computed(() => Object.fromEntries(BRANCHES.map(b => [b, commits.value.findLastIndex(c => c.branch === b)])))
const head = computed(() => commits.value.find(c => c.branch === 'main')?.project.id)

const hovered = ref<number | null>(null)
const shown = computed(() => commits.value.find(c => c.project.id === (hovered.value ?? head.value)) ?? commits.value[0])
</script>

<template>
  <div class="min-w-0 overflow-hidden rounded-2xl border border-line-card bg-bg-deep">
    <div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 border-b border-line bg-surface px-4 py-3 text-xs text-subtle">
      <span class="flex min-w-0 items-center gap-1.5">
        <span v-for="i in 3" :key="i" class="size-[9px] shrink-0 rounded-full bg-gutter"/>
        <span class="ml-2 truncate"><span class="text-code-ok">$</span> git log --graph --all</span>
      </span>
      <span class="flex shrink-0 gap-2.5 text-[11px]">
        <span v-for="b in BRANCHES" :key="b" :class="TEXT[b]">● {{ $t(`projects.graph.branches.${b}`) }}</span>
      </span>
    </div>

    <div class="flex flex-col py-3.5 text-xs" @mouseleave="hovered = null">
      <ProjectLink
        v-for="({project, branch}, i) in commits"
        :key="project.id"
        :project="project"
        class="grid min-h-[26px] grid-cols-[16px_16px_16px_minmax(0,1fr)] px-4 text-ink-soft hover:text-ink"
        :class="shown?.project.id === project.id && 'bg-surface text-ink'"
        @mouseenter="hovered = project.id"
        @focus="hovered = project.id"
      >
        <span v-for="lane in BRANCHES" :key="lane" class="relative flex items-center justify-center">
          <span
            v-if="i <= lastOf[lane]!"
            class="absolute top-0 left-1/2 -ml-px w-0.5"
            :class="[LINE[lane], lane === branch ? '' : 'opacity-40', i === lastOf[lane] ? 'bottom-1/2' : 'bottom-0']"
          />
          <span
            v-if="lane === branch"
            class="relative rounded-full transition-shadow"
            :class="[LINE[lane], project.id === head ? 'size-[11px]' : 'size-[9px]', shown?.project.id === project.id && 'ring-4 ring-current/20', TEXT[lane]]"
          />
        </span>
        <span class="flex min-w-0 items-center gap-2.5 pl-2">
          <span class="shrink-0 text-branch-client">{{ hashOf(project.slug) }}</span>
          <span v-if="project.id === head" class="shrink-0 rounded bg-accent px-1.5 text-[10px] font-bold text-bg">HEAD</span>
          <span class="truncate">{{ project.name }}</span>
        </span>
      </ProjectLink>
    </div>

    <div class="flex justify-between gap-3 border-t border-line px-4 py-3 text-[11px] text-subtle">
      <span v-if="shown" class="truncate">
        {{ $t(`projects.graph.branches.${shown.branch}`) }} · {{ shown.project.name }} · {{ shown.project.note || hostOf(shown.project.url) }}
      </span>
      <span class="shrink-0 text-ghost">{{ $t('projects.graph.hint') }}</span>
    </div>
  </div>
</template>
