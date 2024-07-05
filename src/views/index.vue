<script setup lang="ts">
const router = useRouter()

// log work dialog
const logWorkDialogVisible = ref(false)

const viewAllLogWorks = async () => {
  router.push('/work-logs')
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
              <Button
                label="View all"
                severity="secondary"
                class="w-full"
                @click="viewAllLogWorks"
              />
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>

  <Dialog v-model:visible="logWorkDialogVisible" modal header="Log your work">
    <LogWorkForm @cancel="logWorkDialogVisible = false" @save="viewAllLogWorks" />
  </Dialog>
</template>
