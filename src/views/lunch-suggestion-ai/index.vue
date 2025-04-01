<script setup lang="ts">
import { chatWithGenAI } from '@/services/genai-service'

const userInput = ref()
const response = ref()

const makeRequest = () => {
  chatWithGenAI(userInput.value).then((res) => {
    if (res.data?.choices) {
      response.value = res.data.choices[0].message.content
    }
  })
}
</script>

<template>
  <div class="mx-auto" style="max-width: 50rem">
    <Textarea
      v-model="userInput"
      placeholder="Anh trai hôm nay muốn ăn gì nào?"
      @keyup.ctrl.enter="makeRequest"
      class="w-full"
    />
    <span class="text-xs text-500">Ctrl + Enter để submit nhé</span>
    <div v-if="response" class="chatWrapper" v-html="response"></div>
  </div>
</template>

<style lang="css" scoped>
.chatWrapper {
  min-height: 200px;
  /* border: solid 1px gray; */
  border-radius: 8px;
  margin-top: 3rem;
}
</style>
