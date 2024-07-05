<script setup lang="ts">
import { getWorkLogService } from '@/services/work-log-service'

// all log work dialog
const allWorkLogs = ref()
const workLogService = getWorkLogService()

const getAllWorkLogs = () => {
  workLogService.getAll().then((res) => {
    allWorkLogs.value = res
  })
}

getAllWorkLogs()

const editingRows = ref([])

const onRowEditSave = async (event: any) => {
  let { newData } = event

  await workLogService.createOrUpdate(newData)
  allWorkLogs.value = await workLogService.getAll()
}

const removeWorkLog = async (data: any) => {
  await workLogService.delete(data.date)
  allWorkLogs.value = await workLogService.getAll()
}

const logWorkDialogVisible = ref(false)
const addNew = () => {
  logWorkDialogVisible.value = true
}
const onSave = () => {
  logWorkDialogVisible.value = false
  getAllWorkLogs()
}
</script>

<template>
  <div class="border-round-md p-5 bg-white">
    <div class="flex flex-wrap justify-content-between">
      <p class="text-2xl font-bold mt-0">Work logs</p>
      <Button text icon="pi pi-plus" label="Add" @click="addNew" />
    </div>
    <DataTable
      v-model:editingRows="editingRows"
      :value="allWorkLogs"
      editMode="row"
      size="small"
      @row-edit-save="onRowEditSave"
    >
      <Column field="date" header="Date"></Column>
      <Column field="task" header="Task">
        <template #editor="{ data, field }">
          <InputText v-model="data[field]" />
        </template>
      </Column>

      <Column
        :rowEditor="true"
        style="width: 10%; min-width: 8rem"
        bodyStyle="text-align:center"
      ></Column>
      <Column bodyStyle="text-align:center">
        <template #body="slotProps">
          <Button
            icon="pi pi-times"
            severity="danger"
            class="h-2rem w-2rem"
            text
            rounded
            @click="removeWorkLog(slotProps.data)"
          />
        </template>
      </Column>
    </DataTable>
    <Dialog v-model:visible="logWorkDialogVisible" modal header="Log your work">
      <LogWorkForm @cancel="logWorkDialogVisible = false" @save="onSave" />
    </Dialog>
  </div>
</template>

<style lang="scss" scoped></style>
