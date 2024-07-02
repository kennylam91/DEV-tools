<script setup lang="ts">
import type { WorkLog } from '@/models/work-log';
import { getWorkLogService } from '@/services/work-log-service'
import DataTable from 'primevue/datatable';

const workLogService = getWorkLogService();

// log work dialog
const logWorkDialogVisible = ref(false)
const workLogForm = reactive({
  date: new Date(),
  task: ''
})
const saveLogWork = async () => {
  // call api to save
  logWorkDialogVisible.value = false
  const newWorkLog: WorkLog = {
    date: workLogForm.date.getFullYear() + "-" + workLogForm.date.getMonth() + "-" + workLogForm.date.getDate(),
    task: workLogForm.task,
    username: 'lampv'
  }

  await workLogService.createOrUpdate(newWorkLog)

  workLogForm.date = new Date()
  workLogForm.task = ''
}

// all log work dialog
const viewAllLogWorksDialogVisible = ref(false)
const allLogWorks = ref()
const viewAllLogWorks = async () => {
  allLogWorks.value = await workLogService.getAll();
  viewAllLogWorksDialogVisible.value = true
}
const editingRows = ref([]);

const onRowEditSave = async (event: any) => {
  let { newData, index } = event;

  await workLogService.createOrUpdate(newData)
  allLogWorks.value = await workLogService.getAll();
};

const removeWorkLog = async (data: any) => {
  await workLogService.delete(data.date)
  allLogWorks.value = await workLogService.getAll();
}



</script>

<template>
  <div>
    <div class="grid">
      <div class="sm:col-6 lg:col-3">
        <Card>
          <template #title> Log work</template>
          <template #footer>
            <div class="flex gap-1 flex-column">
              <Button label="Log work" class="w-full" @click="logWorkDialogVisible = true" />
              <Button label="View all" severity="secondary" class="w-full" @click="viewAllLogWorks" />
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>

  <Dialog v-model:visible="logWorkDialogVisible" modal header="Log your work">
    <div class="grid">
      <div class="col-6">
        <div class="flex flex-column gap-2">
          <label for="dateInput">Date</label>
          <Calendar v-model="workLogForm.date" view="date" />
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
      <Button type="button" label="Cancel" severity="secondary" @click="logWorkDialogVisible = false"></Button>
      <Button type="button" :disabled="!workLogForm.date || !workLogForm.task" label="Save"
        @click="saveLogWork"></Button>
    </div>
  </Dialog>

  <Dialog v-model:visible="viewAllLogWorksDialogVisible" modal header="All Work Logs">
    <DataTable v-model:editingRows="editingRows" :value="allLogWorks" editMode="row" @row-edit-save="onRowEditSave">
      <Column field="date" header="Date">

      </Column>
      <Column field="task" header="Task">
        <template #editor="{ data, field }">
          <InputText v-model="data[field]" />
        </template>
      </Column>

      <Column :rowEditor="true" style="width: 10%; min-width: 8rem" bodyStyle="text-align:center"></Column>
      <Column bodyStyle="text-align:center">
        <template #body="slotProps">
          <Button icon="pi pi-times" severity="danger" text rounded aria-label="Cancel"
            @click="removeWorkLog(slotProps.data)" />
        </template>
      </Column>
    </DataTable>
  </Dialog>
</template>

<style lang="scss" scoped></style>