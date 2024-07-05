<script setup lang="ts">
import { getWorkLogService } from '@/services/work-log-service'

// all log work dialog
const allLogWorks = ref()
const workLogService = getWorkLogService()

workLogService.getAll().then((res) => {
  allLogWorks.value = res
})

const editingRows = ref([])

const onRowEditSave = async (event: any) => {
  let { newData, index } = event

  await workLogService.createOrUpdate(newData)
  allLogWorks.value = await workLogService.getAll()
}

const removeWorkLog = async (data: any) => {
  await workLogService.delete(data.date)
  allLogWorks.value = await workLogService.getAll()
}
</script>

<template>
  <div>
    <p class="text-2xl font-medium">Work logs</p>
    <DataTable
      class="border-round-md p-3 bg-white"
      v-model:editingRows="editingRows"
      :value="allLogWorks"
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
  </div>
</template>

<style lang="scss" scoped></style>
