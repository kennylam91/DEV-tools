<script setup lang="ts">
import type { QuizQuestion, QuizResult, QuizSet } from '@/models/quiz'
import { getQuizService } from '@/services/quiz-service'

const quizService = getQuizService()
const quizSets = ref<QuizSet[]>(quizService.getSets())
const selectedSetId = ref<string | null>(null)
const editingSetId = ref<string | null>(null)
const setName = ref('')
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const errorMessage = ref('')
const practiceQuestionIndex = ref(0)
const selectedAnswer = ref('')
const practiceScore = ref(0)
const practiceComplete = ref(false)
const results = ref<QuizResult[]>([])

const selectedSet = computed(() => quizSets.value.find((set) => set.id === selectedSetId.value) ?? null)
const currentQuestion = computed<QuizQuestion | null>(
  () => selectedSet.value?.questions[practiceQuestionIndex.value] ?? null
)
const averageScore = computed(() => {
  if (!results.value.length) return 0
  return Math.round(
    (results.value.reduce((sum, result) => sum + result.score / result.total, 0) /
      results.value.length) *
      100
  )
})

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`

const resetForm = () => {
  editingSetId.value = null
  setName.value = ''
  selectedFile.value = null
  if (fileInput.value) fileInput.value.value = ''
}

const startCreate = () => {
  resetForm()
  errorMessage.value = ''
}

const startEdit = (quizSet: QuizSet) => {
  editingSetId.value = quizSet.id
  setName.value = quizSet.name
  selectedFile.value = null
  errorMessage.value = ''
}

const onFileSelected = (event: Event) => {
  const input = event.target as HTMLInputElement
  selectedFile.value = input.files?.[0] ?? null
  errorMessage.value = ''
}

const parseCsv = (csv: string): QuizQuestion[] => {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index]
    const next = csv[index + 1]
    if (character === '"' && quoted && next === '"') {
      cell += '"'
      index += 1
    } else if (character === '"') {
      quoted = !quoted
    } else if (character === ',' && !quoted) {
      row.push(cell.trim())
      cell = ''
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && next === '\n') index += 1
      row.push(cell.trim())
      if (row.some(Boolean)) rows.push(row)
      row = []
      cell = ''
    } else {
      cell += character
    }
  }
  row.push(cell.trim())
  if (row.some(Boolean)) rows.push(row)

  if (rows.length < 2) throw new Error('The CSV must include a header and at least one question.')
  const headers = rows[0].map((header) => header.toLowerCase())
  const required = [
    'question',
    'optiona',
    'optionb',
    'optionc',
    'optiond',
    'correctanswerr',
    'explaination'
  ]
  const missing = required.filter((header) => !headers.includes(header))
  if (missing.length) throw new Error(`Missing CSV columns: ${missing.join(', ')}`)

  const indexOf = (header: string) => headers.indexOf(header)
  return rows.slice(1).map((values, index) => {
    const question = values[indexOf('question')] ?? ''
    const options = ['optiona', 'optionb', 'optionc', 'optiond'].map(
      (header) => values[indexOf(header)] ?? ''
    ) as [string, string, string, string]
    const rawCorrectAnswer = values[indexOf('correctanswerr')] ?? ''
    const answerIndex = ['a', 'b', 'c', 'd'].indexOf(rawCorrectAnswer.toLowerCase())
    const correctAnswer = answerIndex >= 0 ? options[answerIndex] : rawCorrectAnswer
    if (!question || options.some((option) => !option) || !correctAnswer) {
      throw new Error(`Question row ${index + 2} is incomplete.`)
    }
    return {
      id: makeId(),
      question,
      options,
      correctAnswer,
      explanation: values[indexOf('explaination')] ?? ''
    }
  })
}

const saveSet = async () => {
  errorMessage.value = ''
  if (!setName.value.trim()) {
    errorMessage.value = 'Enter a name for the quiz set.'
    return
  }
  try {
    const existing = quizSets.value.find((set) => set.id === editingSetId.value)
    let questions = existing?.questions ?? []
    let csvFileName = existing?.csvFileName
    let csvContent = existing?.csvContent
    if (selectedFile.value) {
      if (!selectedFile.value.name.toLowerCase().endsWith('.csv')) {
        errorMessage.value = 'Only CSV files can be imported.'
        return
      }
      csvContent = await selectedFile.value.text()
      questions = parseCsv(csvContent)
      csvFileName = selectedFile.value.name
    }
    if (!questions.length) {
      errorMessage.value = 'Import a CSV file before saving the quiz set.'
      return
    }
    const now = new Date().toISOString()
    const quizSet: QuizSet = {
      id: existing?.id ?? makeId(),
      name: setName.value.trim(),
      questions,
      csvFileName,
      csvContent,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now
    }
    quizService.saveSet(quizSet)
    quizSets.value = quizService.getSets()
    resetForm()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to import this CSV file.'
  }
}

const deleteSet = (quizSet: QuizSet) => {
  if (!window.confirm(`Delete "${quizSet.name}" and its results?`)) return
  quizService.deleteSet(quizSet.id)
  quizSets.value = quizService.getSets()
  if (selectedSetId.value === quizSet.id) selectedSetId.value = null
}

const downloadCsv = (quizSet: QuizSet) => {
  if (!quizSet.csvContent) return
  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([quizSet.csvContent], { type: 'text/csv' }))
  link.download = quizSet.csvFileName ?? `${quizSet.name}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}

const startPractice = (quizSet: QuizSet) => {
  selectedSetId.value = quizSet.id
  practiceQuestionIndex.value = 0
  practiceScore.value = 0
  selectedAnswer.value = ''
  practiceComplete.value = false
  results.value = quizService.getResults(quizSet.id)
}

const submitAnswer = () => {
  if (!currentQuestion.value || !selectedAnswer.value) return
  if (selectedAnswer.value === currentQuestion.value.correctAnswer) practiceScore.value += 1
  if (practiceQuestionIndex.value === selectedSet.value!.questions.length - 1) {
    const result: QuizResult = {
      id: makeId(),
      quizSetId: selectedSet.value!.id,
      score: practiceScore.value + (selectedAnswer.value === currentQuestion.value.correctAnswer ? 1 : 0),
      total: selectedSet.value!.questions.length,
      completedAt: new Date().toISOString()
    }
    quizService.saveResult(result)
    results.value = quizService.getResults(selectedSet.value!.id)
    practiceComplete.value = true
  } else {
    practiceQuestionIndex.value += 1
    selectedAnswer.value = ''
  }
}

watch(selectedSetId, (id) => {
  results.value = id ? quizService.getResults(id) : []
})
</script>

<template>
  <div class="quiz-page border-round-md p-5 bg-white">
    <div class="flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <p class="page-title">Quiz</p>
        <p class="text-color-secondary mt-2 mb-0">Create sets, import questions, and track your practice.</p>
      </div>
      <Button label="New quiz set" icon="pi pi-plus" @click="startCreate" />
    </div>

    <div v-if="errorMessage" class="p-message p-message-error mb-3">{{ errorMessage }}</div>

    <div class="grid">
      <div class="col-12 lg:col-5">
        <Card>
          <template #title>{{ editingSetId ? 'Update quiz set' : 'Create quiz set' }}</template>
          <template #content>
            <div class="flex flex-column gap-2 mb-3">
              <label for="quiz-name">Name</label>
              <InputText id="quiz-name" v-model="setName" placeholder="e.g. JavaScript basics" />
            </div>
            <div class="flex flex-column gap-2">
              <label for="quiz-csv">CSV questions</label>
              <input
                id="quiz-csv"
                ref="fileInput"
                type="file"
                accept=".csv,text/csv"
                class="p-inputtext p-component"
                @change="onFileSelected"
              />
              <small class="text-color-secondary">
                Question,OptionA,OptionB,OptionC,OptionD,CorrectAnswerr,Explaination
              </small>
              <small v-if="editingSetId && !selectedFile" class="text-color-secondary">
                Leave empty to keep the current imported file.
              </small>
            </div>
          </template>
          <template #footer>
            <div class="flex justify-content-end gap-2">
              <Button v-if="editingSetId" label="Cancel" severity="secondary" text @click="resetForm" />
              <Button :label="editingSetId ? 'Update' : 'Save'" @click="saveSet" />
            </div>
          </template>
        </Card>

        <Card class="mt-3">
          <template #title>Quiz sets</template>
          <template #content>
            <div v-if="!quizSets.length" class="text-color-secondary">No quiz sets yet.</div>
            <div v-for="quizSet in quizSets" :key="quizSet.id" class="quiz-set-row">
              <div>
                <strong>{{ quizSet.name }}</strong>
                <div class="text-sm text-color-secondary">
                  {{ quizSet.questions.length }} questions<span v-if="quizSet.csvFileName"> · {{ quizSet.csvFileName }}</span>
                </div>
              </div>
              <div class="flex gap-1">
                <Button icon="pi pi-play" text rounded aria-label="Practice" @click="startPractice(quizSet)" />
                <Button
                  v-if="quizSet.csvContent"
                  icon="pi pi-download"
                  text
                  rounded
                  aria-label="Download CSV"
                  @click="downloadCsv(quizSet)"
                />
                <Button icon="pi pi-pencil" text rounded aria-label="Edit" @click="startEdit(quizSet)" />
                <Button icon="pi pi-trash" text rounded severity="danger" aria-label="Delete" @click="deleteSet(quizSet)" />
              </div>
            </div>
          </template>
        </Card>
      </div>

      <div class="col-12 lg:col-7">
        <Card v-if="selectedSet">
          <template #title>Practice: {{ selectedSet.name }}</template>
          <template #content>
            <div v-if="practiceComplete" class="text-center py-4">
              <i class="pi pi-check-circle text-green-500 text-5xl"></i>
              <h2 class="mb-2">Practice complete</h2>
              <p class="text-xl mt-0">You scored {{ practiceScore }} / {{ selectedSet.questions.length }}</p>
              <Button label="Try again" icon="pi pi-refresh" @click="startPractice(selectedSet)" />
            </div>
            <div v-else-if="currentQuestion">
              <div class="flex justify-content-between text-color-secondary mb-3">
                <span>Question {{ practiceQuestionIndex + 1 }} of {{ selectedSet.questions.length }}</span>
                <span>Score: {{ practiceScore }}</span>
              </div>
              <h3>{{ currentQuestion.question }}</h3>
              <div class="flex flex-column gap-2">
                <div v-for="option in currentQuestion.options" :key="option" class="flex align-items-center">
                  <RadioButton v-model="selectedAnswer" :input-id="option" name="quiz-answer" :value="option" />
                  <label :for="option" class="ml-2">{{ option }}</label>
                </div>
              </div>
              <Button class="mt-4" label="Submit answer" :disabled="!selectedAnswer" @click="submitAnswer" />
            </div>
          </template>
        </Card>
        <Card v-else>
          <template #content>
            <div class="text-center text-color-secondary py-6">
              <i class="pi pi-list-check text-5xl mb-3"></i>
              <p>Select a quiz set to start practicing.</p>
            </div>
          </template>
        </Card>

        <Card v-if="selectedSet" class="mt-3">
          <template #title>Practice results</template>
          <template #content>
            <p class="mt-0">Average score: <strong>{{ averageScore }}%</strong></p>
            <DataTable :value="results" size="small">
              <Column field="score" header="Score">
                <template #body="{ data }">{{ data.score }} / {{ data.total }}</template>
              </Column>
              <Column field="completedAt" header="Completed">
                <template #body="{ data }">{{ new Date(data.completedAt).toLocaleString() }}</template>
              </Column>
            </DataTable>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quiz-set-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--surface-border);
}

.quiz-set-row:last-child {
  border-bottom: 0;
}
</style>
