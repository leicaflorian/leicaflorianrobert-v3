<!-- The "bare" contact form of legacy mode: same fields, same submission. -->
<script setup lang="ts">
const {status, submit} = useContactForm()
</script>

<template>
  <form class="flex max-w-[420px] flex-col gap-2" @submit.prevent="submit">
    <label>{{ $t('form.legacy.name') }} <input type="text" name="name" required class="border border-black px-1 font-legacy text-base"></label>
    <label>{{ $t('form.legacy.email') }} <input type="email" name="email" required class="border border-black px-1 font-legacy text-base"></label>
    <label>{{ $t('form.legacy.message') }}<br><textarea name="message" rows="4" cols="40" required class="border border-black px-1 font-legacy text-base"/></label>
    <div class="flex gap-1">
      <input type="submit" :value="$t('form.legacy.submit')" :disabled="status === 'sending'" class="cursor-pointer border border-black bg-legacy-face px-2">
      <input type="reset" :value="$t('form.legacy.reset')" class="cursor-pointer border border-black bg-legacy-face px-2">
    </div>
    <p v-if="status === 'sent'" class="m-0"><b>{{ $t('form.sent') }}</b></p>
    <p v-else-if="status === 'error'" class="m-0 text-[red]"><b>{{ $t('form.error') }}</b></p>
  </form>
</template>
