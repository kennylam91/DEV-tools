<script setup lang="ts">
import type { WorkLog } from '@/models/work-log'
import { getWorkLogService } from '@/services/work-log-service'
import { format } from 'date-fns'

const emit = defineEmits(['cancel', 'save'])

const workLogService = getWorkLogService()

const workLogForm = reactive({
  date: new Date(),
  task: ''
})
const saveLogWork = async () => {
  // call api to save
  const newWorkLog: WorkLog = {
    date: format(workLogForm.date, 'yyyy-MM-dd'),
    task: workLogForm.task,
    username: 'lampv'
  }

  await workLogService.createOrUpdate(newWorkLog)

  workLogForm.date = new Date()
  workLogForm.task = ''
  emit('save')
}
</script>

<template>
  <div class="grid">
    <div class="col-6">
      <div class="flex flex-column gap-2">
        <label for="dateInput">Date</label>
        <Calendar v-model="workLogForm.date" view="date" :max-date="new Date()" />
      </div>
    </div>
    <div class="col-6">
      <div class="flex flex-column gap-2">
        <label for="dateInput">Task</label>
        <InputText v-model="workLogForm.task" :pt="{ autofocus: true }" />
      </div>
    </div>
  </div>
  <div class="flex justify-content-end gap-2 mt-3">
    <Button type="button" label="Cancel" severity="secondary" @click="$emit('cancel')"></Button>
    <Button
      type="button"
      :disabled="!workLogForm.date || !workLogForm.task"
      label="Save"
      @click="saveLogWork"
    ></Button>
  </div>
</template>

<style lang="scss" scoped></style>
