<template>
  <div class="border-round-md p-5 bg-white">
    <div class="page-title">Encode to Base64</div>
    <div class="mt-3">
      <Textarea
        v-model="inputText"
        rows="8"
        class="w-full"
        variant="filled"
        placeholder="Paste text here"
      />
      <Button label="Encode" class="mt-3" @click="encode" />
      <Textarea :value="encodedText" rows="10" class="w-full mt-3" variant="filled" />
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

<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
const encodedText = ref('')
const inputText = ref('')
const { copy, copied } = useClipboard({ source: encodedText })

const encode = () => {
  encodedText.value = encodeBase64(inputText.value)
}

const encodeBase64 = (decodedText: string) => {
  return btoa(decodedText)
}
</script>

<style scoped></style>
