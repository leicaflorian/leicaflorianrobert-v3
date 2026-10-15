<script setup lang="ts">
import type {PageContact, Site} from '~/types/content'

defineProps<{
  site: Site
  page: PageContact
}>()

const card = 'flex flex-col gap-5 rounded-2xl border border-line-card bg-surface p-8'
const cardTitle = 'm-0 text-xs font-medium text-accent'
</script>

<template>
  <section>
    <div class="page grid grid-cols-2 items-end gap-18 pb-30 pt-28 max-[860px]:grid-cols-1">
      <div>
        <UiAvailableBadge v-if="site.available"/>
        <UiPageTitle class="mt-8">{{ $t('contact.title') }}</UiPageTitle>
      </div>
      <div>
        <p class="m-0 mb-5 text-[15px] leading-[1.8] text-muted">{{ page.intro }}</p>
        <a
          :href="`mailto:${site.email}`"
          class="inline-block break-all border-b-2 border-accent pb-1.5 text-[clamp(16px,2vw,22px)] font-bold text-ink hover:text-accent"
        >{{ site.email }} ↗</a>
      </div>
    </div>
  </section>

  <ContactFormSection :label="$t('contact.write.label')" :title="$t('contact.write.title')" :image="page.contact_image"/>

  <section class="border-t border-line">
    <div class="page section-y">
      <UiSectionLabel>{{ $t('contact.where.label') }}</UiSectionLabel>
      <UiSectionTitle class="mb-14">{{ $t('contact.where.title') }}</UiSectionTitle>
      <div class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-6">
        <div :class="card">
          <h3 :class="cardTitle">{{ $t('contact.contacts') }}</h3>
          <div class="flex flex-col gap-1.5">
            <span class="text-xs text-dim">{{ $t('contact.email') }}</span>
            <a :href="`mailto:${site.email}`" class="break-all text-sm text-ink hover:text-accent">{{ site.email }}</a>
          </div>
          <div class="flex flex-col gap-1.5">
            <span class="text-xs text-dim">{{ $t('contact.pec') }}</span>
            <a :href="`mailto:${site.pec}`" class="text-sm text-ink hover:text-accent">{{ site.pec }}</a>
          </div>
        </div>

        <div :class="card">
          <h3 :class="cardTitle">{{ $t('contact.social') }}</h3>
          <a :href="site.github" target="_blank" rel="noopener" class="flex justify-between gap-3 border-b border-line-card py-3.5 text-sm text-ink hover:text-accent">
            <span>GitHub</span><span class="text-subtle">{{ shortUrl(site.github) }} ↗</span>
          </a>
          <a :href="site.linkedin" target="_blank" rel="noopener" class="flex justify-between gap-3 pb-3.5 text-sm text-ink hover:text-accent">
            <span>LinkedIn</span><span class="text-subtle">{{ lastSegment(site.linkedin) }} ↗</span>
          </a>
        </div>

        <div :class="card">
          <h3 :class="cardTitle">{{ $t('contact.company') }}</h3>
          <div class="text-[13px] leading-loose text-ink-soft">
            <div class="font-bold text-ink">{{ site.name }}</div>
            <div>{{ site.street }}</div>
            <div>{{ site.postal_code }} {{ site.city }}, {{ site.province }}</div>
            <div class="mt-3"><span class="text-dim">piva:</span> <span class="text-code-number">{{ site.vat }}</span></div>
            <div><span class="text-dim">rea:</span> <span class="text-code-string">"{{ site.rea }}"</span></div>
            <div><span class="text-dim">sdi:</span> <span class="text-code-string">"{{ site.sdi }}"</span></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
