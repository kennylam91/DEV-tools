<script setup lang="ts">
import { json2csv } from 'json-2-csv'

const inputHtml = ref('')
const output = ref('')

const convertMatchDetailElementToJson = (ul: Element) => {
  // Get all li elements
  const liElements = ul.querySelectorAll('li')
  const items = Array.from(liElements)

  // Extract headers (first 7 <li> elements before the first player data)
  const headers: string[] = ['player', 'team', 'civil', 'bronzeTime', 'killLoss', 'tech', 'result']

  // Initialize result array
  const result = []

  // Process player data (each player has 7 <li> elements)
  for (let i = 7; i < items.length; i += 7) {
    // Skip clear divs or unexpected elements
    if (items[i].style.width !== '20%') continue // Ensure it's a player row start

    const row: any = {}
    for (let j = 0; j < 7; j++) {
      if (i + j < items.length) {
        // Clean up text content, removing extra whitespace
        let value = items[i + j].textContent?.trim()

        // For Kill/Loss, combine values (e.g., "8/7")
        if (headers[j] === 'Kill/Loss') {
          const kill = items[i + j].querySelector('b[style*="color:green"]')?.textContent || ''
          const loss = items[i + j].querySelector('b[style*="color:red"]')?.textContent || ''
          value = `${kill}/${loss}`
        }

        row[headers[j]] = value
      }
    }
    if (row.player !== 'dev_chem_che') {
      return row
    }
  }
}

const convertRowToJson = (rowHtml: Element): any => {
  // Get all td elements
  const cells = rowHtml.querySelectorAll('td')
  if (cells.length === 0) {
    console.error('No td elements found')
    return {}
  }

  // Define headers based on content
  const headers = [
    'matchId',
    'matchType',
    'player',
    'civil',
    'bronzeTime',
    'killLoss',
    'result',
    'timestamp'
  ]

  // Extract cell values
  const result = {}
  cells.forEach((cell, index) => {
    if (index < headers.length) {
      let value = cell.textContent?.trim()

      // Special handling for Kill/Loss column
      if (headers[index] === 'Kill/Loss') {
        const kill = cell.querySelector('span[style*="color:green"]')?.textContent || ''
        const loss = cell.querySelector('span[style*="color:red"]')?.textContent || ''
        value = `${kill}/${loss}`
      }

      result[headers[index]] = value
    }
  })

  return result
}

const analyze = async () => {
  console.log('analyze')

  // Parse HTML string into a DOM object
  const parser = new DOMParser()
  const doc = parser.parseFromString(inputHtml.value, 'text/html')

  // Select matches with class 'tr.detail_match'
  const allMatches: any[] = []
  const matches = doc.querySelectorAll('tr.match_log')
  matches.forEach((matchElement) => {
    const matchData = convertRowToJson(matchElement)
    allMatches.push(matchData)

    // Select tr.detail_match
    const rowId = matchElement.id.split('-')[1]
    const detailMatchEl = doc.querySelector(`#detail_${rowId}`)
    if (detailMatchEl) {
      const ulElement = detailMatchEl.querySelector('ul.detail_match_detail')
      if (ulElement) {
        matchData.opponent = convertMatchDetailElementToJson(ulElement)
      }
    }
  })

  output.value = await json2csv(allMatches)
}
</script>

<template>
  <div class="border-round-md p-5 bg-white">
    <div class="page-title">Analyze Ego results</div>
    <div class="mt-3">
      <Textarea
        v-model="inputHtml"
        rows="20"
        class="w-full"
        variant="filled"
        placeholder="Paste html here"
      />
      <Button label="Analyze" class="mt-3" @click="analyze" />
      <Textarea :value="output" rows="10" class="w-full mt-3" variant="filled" />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
