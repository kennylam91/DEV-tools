<template>
  <div>
    <h1>JSON Array Table Viewer</h1>

    <label for="jsonInput">Input JSON Data:</label> <br />
    <textarea
      id="jsonInput"
      v-model="jsonInput"
      rows="10"
      cols="50"
      placeholder="Paste JSON array here"
    ></textarea>
    <p v-if="jsonError" style="color: red">{{ jsonError }}</p>

    <div v-if="parsedData && parsedData.length">
      <h3>Toggle Columns:</h3>
      <div
        v-for="column in allColumns"
        :key="column"
        style="display: inline-block; margin-right: 10px"
      >
        <input type="checkbox" :id="'col-' + column" :value="column" v-model="visibleColumns" />
        <label :for="'col-' + column">{{ column }}</label>
      </div>

      <JsonTable :jsonArray="parsedData" :visibleColumns="visibleColumns" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import JsonTable from '@/components/JsonTable.vue'

const jsonInput = ref(`[
  { "id": 1, "name": "Alice", "age": 30, "city": "New York" },
  { "id": 2, "name": "Bob", "age": 24, "city": "Los Angeles" },
  { "id": 3, "name": "Charlie", "age": 29, "city": "Chicago", "occupation": "Engineer" }
]`)

const parsedData = ref<any[]>([])
const jsonError = ref<string>('')

function parseInput() {
  try {
    const parsed = JSON.parse(jsonInput.value)
    if (!Array.isArray(parsed)) {
      jsonError.value = 'Input JSON must be an array'
      parsedData.value = []
    } else {
      jsonError.value = ''
      parsedData.value = parsed
    }
  } catch (e: any) {
    jsonError.value = e.message
    parsedData.value = []
  }
}

watch(jsonInput, () => {
  parseInput()
})

// Initial parsing on mount
parseInput()

const allColumns = computed(() => {
  const set = new Set<string>()
  parsedData.value.forEach((item) => {
    Object.keys(item).forEach((key) => set.add(key))
  })
  return Array.from(set)
})

const visibleColumns = ref<string[]>([])

// When columns available change, default to all selected
watch(allColumns, (newCols) => {
  visibleColumns.value = [...newCols]
})
</script>
