<script setup lang="ts">
import { PackageURL } from 'packageurl-js'
import axios from 'axios'

const purlStr = ref('')
const apiRes = ref()
const loading = ref(false)

const makeRequest = () => {
  const purl = PackageURL.parseString(purlStr.value)
  const type = purl[0]
  const namespace = purl[1]
  const name = purl[2]
  const version = purl[3]

  let packageName = name
  let packageType = type
  switch (type) {
    case 'maven':
      packageName = namespace ? namespace + ':' + name : name
      break
    case 'npm':
      packageName = namespace ? namespace + '/' + name : name
      break
    case 'golang':
      packageName = namespace ? namespace + '/' + name : name
      packageType = 'go'
      break
  }

  let url = `/v3alpha/systems/${packageType}/packages/${encodeURIComponent(packageName!)}`
  if (version) {
    url = `/v3alpha/systems/${packageType}/packages/${encodeURIComponent(packageName!)}/versions/${version}`
  }

  loading.value = true
  axios
    .get(url, { baseURL: 'https://api.deps.dev', validateStatus: (status) => status === 200 })
    .then((res) => (apiRes.value = res.data))
    .catch((err) => (apiRes.value = err.message))
    .finally(() => (loading.value = false))
}
</script>

<template>
  <div class="border-round-md p-5 bg-white">
    <div class="page-title">Making request to deps.dev</div>

    <div class="mt-3">
      <div class="grid">
        <div class="col-5 flex flex-column gap-3">
          <InputText
            v-model="purlStr"
            placeholder="component/package purl"
            style="font-size: 14px"
          />
          <Button label="Make request" @click="makeRequest" />
        </div>
        <div class="col-7">
          <i
            class="pi pi-spin pi-spinner"
            v-show="loading"
            style="font-size: 2rem; margin-left: 5rem"
          />
          <JsonViewer v-show="!loading" :value="apiRes" boxed expanded :expandDepth="2" copyable />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
