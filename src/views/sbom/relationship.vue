<template>
  <div class="border-round-md p-5 bg-white">
    <div class="page-title">Parse the SPDX Sbom to UML UseCase</div>
    <div class="text-sm text-500 my-2">
      Paste the parsed result into
      <a href="https://www.plantuml.com" target="_blank">https://www.plantuml.com/</a> to see the
      graph.
    </div>
    <div class="mt-3">
      <Textarea
        v-model="sbomJson"
        rows="8"
        class="w-full"
        variant="filled"
        placeholder="Paste sbom json here"
      />
      <div class="flex mt-3 gap-3 align-items-center">
        <label for="levelInput">Level</label>
        <InputNumber
          id="levelInput"
          buttonLayout="horizontal"
          show-buttons
          v-model.number="level"
          input-class="w-3rem"
        >
          <template #incrementbuttonicon>
            <span class="pi pi-plus" />
          </template>
          <template #decrementbuttonicon>
            <span class="pi pi-minus" />
          </template>
        </InputNumber>
        <Button label="Parse" class="" @click="parseToUmlUseCase" :disabled="!sbomJson" />
      </div>
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
const level = ref(0)
const { copy, copied } = useClipboard({ source: umlUseCase })

const parseToUmlUseCase = () => {
  const umlUseCaseRows: string[] = ['@startuml']

  const jsonObject = JSON.parse(sbomJson.value)

  let rootPackageSpdxId: string = ''
  for (const relationShip of jsonObject['relationships']) {
    if (
      relationShip['relationshipType'] === 'DEPENDS_ON' &&
      relationShip['spdxElementId'] === 'SPDXRef-RootPackage'
    ) {
      rootPackageSpdxId = relationShip['relatedSpdxElement']
      break
    }
  }
  let lastLevelPackages: string[] = [rootPackageSpdxId]

  let i = level.value
  while (i >= 0) {
    const newLastLevelPackages: string[] = []
    lastLevelPackages.forEach((firstLevelPk) => {
      jsonObject['relationships'].forEach((relationShip: any) => {
        if (
          relationShip['relationshipType'] === 'DEPENDS_ON' &&
          relationShip['spdxElementId'] === firstLevelPk
        ) {
          const spdxElementId = relationShip['spdxElementId']
          const relatedSpdxElement = relationShip['relatedSpdxElement']
          umlUseCaseRows.push(`(${spdxElementId}) --> (${relatedSpdxElement}) `)
          newLastLevelPackages.push(relatedSpdxElement)
        }
      })
    })

    i--
    lastLevelPackages = newLastLevelPackages
  }

  umlUseCaseRows.push('@enduml')

  umlUseCase.value = umlUseCaseRows.join('\n')

  jsonObject['packages'].forEach((pk: any) => {
    const shortName = (pk['name'] as string).split('.').pop()
    const packageName = [shortName, pk['versionInfo']].join('@')
    umlUseCase.value = umlUseCase.value.replace(new RegExp(pk['SPDXID'], 'g'), packageName)
  })
}
</script>

<style lang="scss" scoped></style>
