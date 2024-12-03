<template>
  <div class="border-round-md p-5 bg-white">
    <div class="page-title">Parse the SPDX Sbom to UML UseCase</div>
    <div class="text-sm text-500 my-2 line-height-2">
      Paste the parsed result into
      <a href="https://www.plantuml.com" target="_blank">https://www.plantuml.com/</a> to see the
      graph.<br />
      You can either search for paths to a specific package or get all packages to a specific level.
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
          :disabled="!!isSearching"
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
        <InputText v-model="search" placeholder="Search for package" />
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
import { RelationshipGraph } from '@/models/relationship-graph'
import { useClipboard } from '@vueuse/core'

const sbomJson = ref('')
const umlUseCase = ref('')
const level = ref(1)
const { copy, copied } = useClipboard({ source: umlUseCase })
const search = ref()

const isSearching = computed(() => search.value)

const parseToGraph = (jsonObject: any) => {
  let packageNameMap = new Map<string, string>()
  let spdxRootId = 'SPDXRef-RootPackage'

  jsonObject['packages'].forEach((pk: any) => {
    const shortName = (pk['name'] as string).split('.').pop()
    const packageName = [shortName, pk['versionInfo']].join('@')
    packageNameMap.set(pk['SPDXID'], packageName)
  })

  const graph = new RelationshipGraph(packageNameMap.get(spdxRootId)!)

  jsonObject['relationships'].forEach((relationShip: any) => {
    if (relationShip['relationshipType'] === 'DEPENDS_ON') {
      const spdxElementId = relationShip['spdxElementId']
      const relatedSpdxElementId = relationShip['relatedSpdxElement']

      if (!packageNameMap.has(spdxElementId)) {
        console.error('spdxElementId not found', spdxElementId)
      }
      if (!packageNameMap.has(relatedSpdxElementId)) {
        console.error('relatedSpdxElementId not found', relatedSpdxElementId)
      }
      graph.addRelationship(
        packageNameMap.get(spdxElementId)!,
        packageNameMap.get(relatedSpdxElementId)!
      )
    }
  })

  return graph
}

const parseToUmlUseCase = () => {
  const jsonObject = JSON.parse(sbomJson.value)
  const graph = parseToGraph(jsonObject)

  const umlUseCaseRows: string[] = ['@startuml', 'left to right direction']

  if (search.value) {
    graph.findPaths(search.value).forEach((path) => {
      for (let i = 0; i < path.length - 1; i++) {
        umlUseCaseRows.push(`(${path[i]}) --> (${path[i + 1]}) `)
      }
    })
  } else {
    graph.traverse(
      level.value,
      (child: string, parent?: string) =>
        parent && child && umlUseCaseRows.push(`(${parent}) --> (${child}) `)
    )
  }

  umlUseCaseRows.push('@enduml')

  umlUseCase.value = umlUseCaseRows.join('\n')
}
</script>

<style lang="scss" scoped></style>
