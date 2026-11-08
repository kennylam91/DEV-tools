<script setup lang="ts">
import { getVcpkgService } from '@/services/vcpkg-service'
import type { Step1Result, Step2Result, Step3Result } from '@/models/vcpkg-package'

const service = getVcpkgService()

// State management
const activeStep = ref(0)
const purlInput = ref('pkg:vcpkg/asmjit@2025-01-22')
const gitTreeInput = ref('')
const loading = ref(false)
const errorMessage = ref('')

// Step results
const step1Result = ref<Step1Result | null>(null)
const step2Result = ref<Step2Result | null>(null)
const step3Result = ref<Step3Result | null>(null)

// Stepper items
const stepperItems = ref([{ label: 'PURL Input' }, { label: 'Git Tree' }, { label: 'Metadata' }])

/**
 * Execute Step 1: Parse PURL and fetch version info
 */
async function executeStep1() {
  if (!purlInput.value.trim()) {
    errorMessage.value = 'Please enter a package URL'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const result = await service.executeStep1(purlInput.value)
    step1Result.value = result
    gitTreeInput.value = result.gitTree
    activeStep.value = 1
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Failed to fetch version information'
  } finally {
    loading.value = false
  }
}

/**
 * Execute Step 2: Fetch git tree and find metadata file
 */
async function executeStep2() {
  if (!gitTreeInput.value.trim()) {
    errorMessage.value = 'Please enter a git tree SHA'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const result = await service.executeStep2(gitTreeInput.value)
    step2Result.value = result

    if (!result.metadataFile) {
      errorMessage.value = 'No metadata file (vcpkg.json or CONTROL) found in the git tree'
      return
    }

    // Automatically proceed to step 3
    await executeStep3(result.metadataFile.sha, result.metadataFile.path)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to fetch git tree'
  } finally {
    loading.value = false
  }
}

/**
 * Execute Step 3: Fetch and display metadata
 */
async function executeStep3(sha: string, fileName: string) {
  loading.value = true
  errorMessage.value = ''

  try {
    const result = await service.executeStep3(sha, fileName)
    step3Result.value = result
    activeStep.value = 2
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to fetch metadata'
  } finally {
    loading.value = false
  }
}

/**
 * Reset the wizard to start over
 */
function resetWizard() {
  activeStep.value = 0
  purlInput.value = 'pkg:vcpkg/asmjit@2025-01-22'
  gitTreeInput.value = ''
  step1Result.value = null
  step2Result.value = null
  step3Result.value = null
  errorMessage.value = ''
}

/**
 * Go back to a specific step
 */
function goToStep(step: number) {
  if (step < activeStep.value) {
    activeStep.value = step
    errorMessage.value = ''
  }
}
</script>

<template>
  <div class="border-round-md p-5 bg-white">
    <div class="card">
      <h1 class="page-title">Vcpkg Package Retrieval</h1>
      <p class="text-gray-600 mb-4">
        Retrieve vcpkg package metadata by package URL (purl). Example: pkg:vcpkg/asmjit@2025-01-22
      </p>

      <!-- Stepper -->
      <Steps :model="stepperItems" :activeStep="activeStep" class="mb-5" />

      <!-- Error Message -->
      <Message
        v-if="errorMessage"
        severity="error"
        :closable="true"
        @close="errorMessage = ''"
        class="mb-4"
      >
        {{ errorMessage }}
      </Message>

      <!-- Step 1: PURL Input -->
      <div v-if="activeStep === 0" class="step-content">
        <h2 class="text-xl font-semibold mb-3">Step 1: Enter Package URL</h2>
        <p class="text-gray-600 mb-4">
          Enter a vcpkg package URL in the format: <code>pkg:vcpkg/portname@version</code>
        </p>

        <div class="flex gap-2 mb-4">
          <InputText
            v-model="purlInput"
            placeholder="pkg:vcpkg/asmjit@2025-01-22"
            class="flex-1"
            :disabled="loading"
            @keyup.enter="executeStep1"
          />
          <Button
            label="Fetch Version"
            icon="pi pi-search"
            @click="executeStep1"
            :loading="loading"
            :disabled="loading"
          />
        </div>

        <!-- Step 1 Results -->
        <div v-if="step1Result" class="result-panel">
          <h3 class="text-lg font-semibold mb-2">Version Information</h3>
          <div class="grid">
            <div class="col-12 md:col-6">
              <strong>Port Name:</strong> {{ step1Result.portName }}
            </div>
            <div class="col-12 md:col-6"><strong>Version:</strong> {{ step1Result.version }}</div>
            <div class="col-12">
              <strong>Git Tree SHA:</strong>
              <code class="ml-2">{{ step1Result.gitTree }}</code>
            </div>
          </div>

          <div class="mt-3">
            <strong>Available Versions ({{ step1Result.allVersions.length }}):</strong>
            <div class="version-list mt-2">
              <DataTable
                :value="step1Result.allVersions"
                :rows="5"
                :paginator="true"
                class="text-sm"
              >
                <Column header="Version" sortable>
                  <template #body="slotProps">
                    <span v-if="slotProps.data['version-date']">
                      <strong>Date:</strong> {{ slotProps.data['version-date'] }}
                    </span>
                    <span v-else-if="slotProps.data['version-semver']">
                      <strong>Semver:</strong> {{ slotProps.data['version-semver'] }}
                    </span>
                    <span v-else> <strong>Version:</strong> {{ slotProps.data.version }} </span>
                  </template>
                </Column>
                <Column field="port-version" header="Port Version" sortable />
                <Column field="git-tree" header="Git Tree SHA">
                  <template #body="slotProps">
                    <code class="text-xs">{{ slotProps.data['git-tree'] }}</code>
                  </template>
                </Column>
              </DataTable>
            </div>
          </div>

          <div class="mt-4">
            <Button label="Continue to Git Tree" icon="pi pi-arrow-right" @click="executeStep2" />
          </div>
        </div>
      </div>

      <!-- Step 2: Git Tree -->
      <div v-if="activeStep === 1" class="step-content">
        <h2 class="text-xl font-semibold mb-3">Step 2: Git Tree Exploration</h2>
        <p class="text-gray-600 mb-4">Enter a git tree SHA or use the one from Step 1.</p>

        <div class="flex gap-2 mb-4">
          <InputText
            v-model="gitTreeInput"
            placeholder="Git tree SHA"
            class="flex-1"
            :disabled="loading"
            @keyup.enter="executeStep2"
          />
          <Button
            label="Fetch Tree"
            icon="pi pi-search"
            @click="executeStep2"
            :loading="loading"
            :disabled="loading"
          />
          <Button
            label="Back"
            icon="pi pi-arrow-left"
            severity="secondary"
            @click="goToStep(0)"
            :disabled="loading"
          />
        </div>

        <!-- Step 2 Results -->
        <div v-if="step2Result" class="result-panel">
          <h3 class="text-lg font-semibold mb-2">Tree Contents</h3>
          <p class="text-gray-600 mb-3">
            Found {{ step2Result.treeEntries.length }} entries in the git tree.
          </p>

          <div
            v-if="step2Result.metadataFile"
            class="bg-green-50 border-green-200 border-1 p-3 mb-3 border-round"
          >
            <div class="flex align-items-center gap-2">
              <i class="pi pi-check-circle text-green-600"></i>
              <strong>Metadata File Found:</strong>
              <code>{{ step2Result.metadataFile.path }}</code>
            </div>
            <div class="mt-2 text-sm text-gray-600">
              SHA: <code>{{ step2Result.metadataFile.sha }}</code>
            </div>
          </div>

          <DataTable :value="step2Result.treeEntries" :rows="10" :paginator="true" class="text-sm">
            <Column field="path" header="Path" sortable>
              <template #body="slotProps">
                <i
                  :class="slotProps.data.type === 'tree' ? 'pi pi-folder' : 'pi pi-file'"
                  class="mr-2"
                ></i>
                {{ slotProps.data.path }}
              </template>
            </Column>
            <Column field="type" header="Type" sortable />
            <Column field="sha" header="SHA">
              <template #body="slotProps">
                <code class="text-xs">{{ slotProps.data.sha.substring(0, 10) }}...</code>
              </template>
            </Column>
            <Column field="size" header="Size" sortable />
          </DataTable>
        </div>
      </div>

      <!-- Step 3: Metadata Display -->
      <div v-if="activeStep === 2" class="step-content">
        <h2 class="text-xl font-semibold mb-3">Step 3: Package Metadata</h2>

        <div v-if="step3Result" class="result-panel">
          <div class="flex justify-content-between align-items-center mb-3">
            <h3 class="text-lg font-semibold">
              {{ step3Result.fileName }}
            </h3>
            <div class="flex gap-2">
              <Button
                label="Start Over"
                icon="pi pi-refresh"
                severity="secondary"
                size="small"
                @click="resetWizard"
              />
              <Button
                label="Back to Tree"
                icon="pi pi-arrow-left"
                severity="secondary"
                size="small"
                @click="goToStep(1)"
              />
            </div>
          </div>

          <TabView>
            <TabPanel header="Parsed Metadata">
              <json-viewer :value="step3Result.metadata" :expand-depth="2" copyable boxed />
            </TabPanel>
            <TabPanel header="Raw Content">
              <pre class="raw-content">{{ step3Result.rawContent }}</pre>
            </TabPanel>
          </TabView>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vcpkg-retrieval-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.step-content {
  min-height: 300px;
}

.result-panel {
  background-color: var(--surface-50);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--surface-200);
}

.version-list {
  max-height: 400px;
  overflow-y: auto;
}

.raw-content {
  background-color: var(--surface-100);
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
}

code {
  background-color: var(--surface-100);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
}
</style>
