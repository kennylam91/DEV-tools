<template>
  <div class="border-round-md p-5 bg-white">
    <div class="page-title">Base64 Decode</div>
    <div class="mt-3">
      <Textarea
        v-model="encodedText"
        rows="8"
        class="w-full"
        variant="filled"
        placeholder="Paste base64 text here"
      />
      <Button label="Convert" class="mt-3" @click="convert" />
      <Textarea :value="decodedText" rows="16" class="w-full mt-3" variant="filled" />
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
import Button from 'primevue/button'
import { useClipboard } from '@vueuse/core'

const encodedText = ref('')
const decodedText = ref('')
const { copy, copied } = useClipboard({ source: decodedText })

const convert = () => {
  decodedText.value = decodeBase64(encodedText.value)
}

const decodeBase64 = (encodedText: string) => {
  console.log('Inbount b64 text has length = ' + encodedText.length)
  var b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  var b0, b1, b2
  var decodedText = ''
  let textMode = true

  // Remove any spaces.
  encodedText = encodedText.replace(/\s/g, '')

  if (encodedText.length % 4) {
    return (
      'Error: Base64 encoded text must have a length divisable by 4; but length is ' +
      encodedText.length
    )
  }

  if (/^[a-z0-9+/]+={0,2}$/i.test(encodedText)) {
    console.log('Encoded string passed validation.')
  } else {
    return 'Error: Base64 encoded string has an invalid character.'
  }

  for (var p = 0; p < encodedText.length; p++) {
    var c = encodedText.charAt(p)
    if (c == '=') {
      // The '=' sign is a pad character.  Wrap things up depending
      // on how many pad characters there are.
      if (p % 2) {
        // There is one pad character; only add first two bytes and quit.
        decodedText += textMode
          ? String.fromCharCode(b0, b1)
          : b0.toString(16) + ' ' + b1.toString(16)
      } else {
        // There are two pad characters; only add first byte and quit.
        decodedText += textMode ? String.fromCharCode(b0) : b0.toString(16)
      }
      break
    }
    var i = b64chars.indexOf(c)
    switch (p % 4) {
      case 0:
        // All 6 bits go to upper 6 bits of b0.
        b0 = i << 2
        break
      case 1:
        // Upper 2 bits fill in lower 2 bits of b0.
        // Lower 4 bits fill in upper 4 bits of b1.
        b0 = b0 | ((i & 0x0030) >>> 4)
        b1 = (i & 0x000f) << 4
        break
      case 2:
        // Upper 4 bits fill in lower 4 bits of b1.
        // Lower 2 bits fill in upper 2 bits of b2.
        b1 = b1 | ((i & 0x003c) >>> 2)
        b2 = (i & 0x0003) << 6
        break
      case 3:
        // All 6 bits fill lower 6 bits of b2.
        b2 = b2 | i
        decodedText += textMode
          ? String.fromCharCode(b0, b1, b2)
          : b0.toString(16) + ' ' + b1.toString(16) + ' ' + b2.toString(16) + ' '
        break
    }
    if (!textMode && p % 16 == 0) {
      decodedText += '\n'
    }
  }
  return decodedText
}
</script>

<style lang="scss" scoped></style>
