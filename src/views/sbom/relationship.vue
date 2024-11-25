<template>
  <div class="border-round-md p-5 bg-white">
    <div class="page-title">Decode from Base64</div>
    <div class="mt-3">
      <Textarea
        v-model="sbomJson"
        rows="8"
        class="w-full"
        variant="filled"
        placeholder="Paste sbom json here"
      />
      <Button label="Parse to UML Usecase" class="mt-3" @click="parseToUmlUseCase" />
      <Textarea :value="umlUseCase" rows="10" class="w-full mt-3" variant="filled" />
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

const sbomJson = ref()
const umlUseCase = ref('')
const { copy, copied } = useClipboard({ source: umlUseCase })

const parseToUmlUseCase = () => {
  const umlUseCaseRows: string[] = ['@startuml']

  const jsonObject = JSON.parse(sbomJson.value)
  jsonObject['relationships'].forEach((relationShip: any) => {
    if (relationShip['relationshipType'] === 'DEPENDS_ON') {
      const spdxElementId = relationShip['spdxElementId']
      const relatedSpdxElement = relationShip['relatedSpdxElement']
      umlUseCaseRows.push(`(${spdxElementId}) --> (${relatedSpdxElement}) `)
    }
  })

  umlUseCaseRows.push('@enduml')

  umlUseCase.value = umlUseCaseRows.join('\n')

  jsonObject['packages'].forEach((pk: any) => {
    const packageName = [pk['name'], pk['versionInfo']].join('@')
    umlUseCase.value = umlUseCase.value.replace(new RegExp(pk['SPDXID'], 'g'), packageName)
  })
}
</script>

<style lang="scss" scoped></style>
