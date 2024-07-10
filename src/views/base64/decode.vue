<template>
  <div class="border-round-md p-5 bg-white">
    <div class="page-title">Decode from Base64</div>
    <div class="mt-3">
      <Textarea
        v-model="encodedText"
        rows="8"
        class="w-full"
        variant="filled"
        placeholder="Paste base64 text here"
      />
      <Button label="Decode" class="mt-3" @click="decode" />
      <Textarea :value="decodedText" rows="10" class="w-full mt-3" variant="filled" />
      <Button
        :label="copied ? 'Copied' : 'Copy to clipboard'"
        class="mt-3"
        severity="secondary"
        :icon="copied ? 'pi pi-check' : 'pi pi-clipboard'"
        @click="() => copy()"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useClipboard } from '@vueuse/core'

const encodedText = ref('')
const decodedText = ref('')
const { copy, copied } = useClipboard({ source: decodedText })

const decode = () => {
  decodedText.value = atob(encodedText.value)
}
</script>

<style lang="scss" scoped></style>
