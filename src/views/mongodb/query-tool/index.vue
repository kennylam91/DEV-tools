<template>
  <div class="border-round-md p-5 bg-white">
    <div class="page-title">Convert ObjectId In Mongodb Query</div>
    <div class="mt-3">
      <Textarea
        v-model="inputQuery"
        rows="15"
        class="w-full"
        variant="filled"
        placeholder="Paste mongodb query here"
      />
      <Button label="Convert" class="mt-3" @click="convert" />
      <Textarea :value="convertedQuery" rows="15" class="w-full mt-3" variant="filled" />
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

const inputQuery = ref<string>('')
const convertedQuery = ref<string>('')
const { copy, copied } = useClipboard({ source: convertedQuery })

const convert = () => {
  console.log('convert')

  const results = inputQuery.value.match(new RegExp('{\\s+\\$oid: "\\w+"\\s+}', 'g'))
  convertedQuery.value = inputQuery.value
  console.log(results)
  if (results?.length) {
    results.forEach((matchStr) => {
      const idMatchResults = matchStr.match(new RegExp('oid: "(\\w+)"'))
      if (idMatchResults?.length) {
        convertedQuery.value = convertedQuery.value.replace(
          matchStr,
          `ObjectId("${idMatchResults[1]}")`
        )
      }
    })
  }
}
</script>

<style lang="scss" scoped></style>
