<template>
  <div>
    <table border="1" cellpadding="8" cellspacing="0">
      <thead>
        <tr>
          <th v-for="header in tableHeaders" :key="header">{{ header }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in jsonArray" :key="index">
          <td v-for="header in tableHeaders" :key="header">
            {{ item[header] !== undefined ? item[header] : '' }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface JsonObject {
  [key: string]: any
}

const props = defineProps<{
  jsonArray: JsonObject[],
  visibleColumns?: string[]
}>()

const tableHeaders = computed(() => {
  if (props.visibleColumns && props.visibleColumns.length > 0) {
    return props.visibleColumns
  }
  const headersSet = new Set<string>()
  props.jsonArray.forEach(item => {
    Object.keys(item).forEach(key => headersSet.add(key))
  })
  return Array.from(headersSet)
})
</script>

<style scoped>
table {
  border-collapse: collapse;
  width: 100%;
}
th {
  background-color: #f0f0f0;
  text-align: left;
}
td, th {
  padding: 8px;
}
</style>
