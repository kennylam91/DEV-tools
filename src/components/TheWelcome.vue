<script setup lang="ts">

const logWorkDialogVisible = ref(false)
const workLog = reactive({
  date: new Date(),
  task: ''
})

const saveLogWork = () => {
  // call api to save
  logWorkDialogVisible.value = false
  workLog.date = new Date()
  workLog.task = ''
}

</script>

<template>
  <div>
    <div class="grid">
      <div class="sm:col-6 lg:col-3">
        <Card>
          <template #title> Log work</template>
          <template #footer>
            <div class="flex gap-4 mt-1">
              <Button label="Log work" class="w-full" @click="logWorkDialogVisible = true" />
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
          <Calendar v-model="workLog.date" />
        </div>
      </div>
      <div class="col-6">
        <div class="flex flex-column gap-2">
          <label for="dateInput">Task</label>
          <InputText v-model="workLog.task" :pt="{ autofocus: true }" />
        </div>
      </div>
    </div>
    <div class="flex justify-content-end gap-2 mt-3">
      <Button type="button" label="Cancel" severity="secondary" @click="logWorkDialogVisible = false"></Button>
      <Button type="button" :disabled="!workLog.date || !workLog.task" label="Save" @click="saveLogWork"></Button>
    </div>
  </Dialog>
</template>

<style lang="scss" scoped></style>