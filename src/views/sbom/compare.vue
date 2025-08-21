<script setup lang="ts">
import type { SpdxJson } from '@/models/spdx-json'
import { Diff } from 'vue-diff'

const firstSbom = ref()
const secondSbom = ref()
const firstPackagesStr = ref()
const secondPackagesStr = ref()

const getPackages = (sbomJson: string): string[] => {
  const jsonObject: SpdxJson = JSON.parse(sbomJson)

  return jsonObject['packages']
    .map((pk) => {
      return (
        pk.externalRefs?.find((ref: any) => ref?.referenceType === 'purl')?.referenceLocator || ''
      )
    })
    .filter((item: any) => !!item)
}

watchEffect(() => {
  if (firstSbom.value && secondSbom.value) {
    firstPackagesStr.value = getPackages(firstSbom.value).sort().join('\n')
    secondPackagesStr.value = getPackages(secondSbom.value).sort().join('\n')
  }
})
</script>
<template>
  <div class="border-round-md p-5 bg-white">
    <div class="page-title">Detect the differences between 2 sbom files</div>
    <div class="mt-4">
      <div class="grid">
        <div class="col-6">
          <Textarea
            v-model="firstSbom"
            rows="15"
            class="w-full text-sm"
            variant="filled"
            placeholder="Paste the first sbom in json format here"
          />
        </div>
        <div class="col-6">
          <Textarea
            v-model="secondSbom"
            rows="15"
            class="w-full text-sm"
            variant="filled"
            placeholder="Paste the second sbom in json format here"
          />
        </div>
      </div>
    </div>
    <div class="mt-4">
      <Diff
        v-show="firstPackagesStr && secondPackagesStr"
        :prev="firstPackagesStr"
        :current="secondPackagesStr"
        virtual-scroll
        folding
      />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
