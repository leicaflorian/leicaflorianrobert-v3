<!-- The "bare" contact form of legacy mode: the same two groups, with checkboxes and drop-downs. -->
<script setup lang="ts">
const {draft, status, submit, reset} = useContactForm()
const pageLink = usePageLink()

const control = 'border border-black px-1 font-legacy text-base'
</script>

<template>
  <form class="flex max-w-[420px] flex-col gap-2" @submit.prevent="submit" @reset.prevent="reset">
    <fieldset class="m-0 flex flex-col gap-2 border border-black px-2 pb-2">
      <legend>{{ $t('form.groups.project') }}</legend>
      <fieldset class="m-0 border border-black px-2 pb-1">
        <legend>{{ $t('form.brief.legacy.types') }}</legend>
        <label v-for="type in BRIEF_OPTIONS.types" :key="type" class="mr-3 inline-block whitespace-nowrap">
          <input v-model="draft.project_types" type="checkbox" name="project_types" :value="type"> {{ $t(`form.brief.options.types.${type}`) }}
        </label>
      </fieldset>
      <label>{{ $t('form.brief.legacy.budget') }}
        <select v-model="draft.budget" name="budget" :class="control">
          <option :value="null">{{ $t('form.brief.legacy.choose') }}</option>
          <option v-for="budget in BRIEF_OPTIONS.budget" :key="budget" :value="budget">{{ $t(`form.brief.options.budget.${budget}`) }}</option>
        </select>
      </label>
      <label>{{ $t('form.brief.legacy.timeline') }}
        <select v-model="draft.timeline" name="timeline" :class="control">
          <option :value="null">{{ $t('form.brief.legacy.choose') }}</option>
          <option v-for="timeline in BRIEF_OPTIONS.timeline" :key="timeline" :value="timeline">{{ $t(`form.brief.options.timeline.${timeline}`) }}</option>
        </select>
      </label>
    </fieldset>
    <fieldset class="m-0 flex flex-col gap-2 border border-black px-2 pb-2">
      <legend>{{ $t('form.groups.you') }}</legend>
      <label>{{ $t('form.legacy.name') }} <input v-model="draft.name" type="text" name="name" required :class="control"></label>
      <label>{{ $t('form.legacy.email') }} <input v-model="draft.email" type="email" name="email" required :class="control"></label>
      <label>{{ $t('form.legacy.message') }}<br><textarea v-model="draft.message" name="message" rows="4" cols="40" required :class="control"/></label>
    </fieldset>
    <div class="flex gap-1">
      <input type="submit" :value="$t('form.legacy.submit')" :disabled="status === 'sending'" class="cursor-pointer border border-black bg-legacy-face px-2">
      <input type="reset" :value="$t('form.legacy.reset')" class="cursor-pointer border border-black bg-legacy-face px-2">
    </div>
    <p class="m-0 text-sm">
      <i18n-t keypath="form.privacy" scope="global">
        <template #link><LegacyLink :href="pageLink('privacy')">{{ $t('form.privacyLink') }}</LegacyLink></template>
      </i18n-t>
    </p>
    <p v-if="status === 'sent'" class="m-0"><b>{{ $t('form.sent') }}</b></p>
    <p v-else-if="status === 'error'" class="m-0 text-[red]"><b>{{ $t('form.error') }}</b></p>
  </form>
</template>
