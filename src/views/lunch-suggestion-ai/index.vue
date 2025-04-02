<script setup lang="ts">
import { chatWithGenAI } from '@/services/genai-service'
import Markdown from 'vue3-markdown-it'

const userInput = ref()
const responses = ref<{ content: string; fromUser?: boolean }[]>([])

const isWaitingResponse = ref(false)
const makeRequest = () => {
  if (isWaitingResponse.value) {
    return
  }
  responses.value.push({ content: userInput.value, fromUser: true })
  userInput.value = ''
  isWaitingResponse.value = true
  chatWithGenAI(userInput.value)
    .then((res) => {
      if (res.data?.choices) {
        responses.value.push({ content: res.data.choices[0].message.content })
        chatInputRef.value.$el.focus()
      }
    })
    .finally(() => {
      isWaitingResponse.value = false
    })
}

const chatInputRef = ref()
</script>

<template>
  <div class="mx-auto" style="max-width: 50rem">
    <div class="chatWrapper">
      <Markdown
        :class="['message', item.fromUser && 'from-user']"
        v-for="(item, index) in responses"
        :key="index"
        :source="item.content"
      ></Markdown>
      <Markdown
        v-if="isWaitingResponse"
        class="message"
        :source="'Chờ xíu, em gái đang trả lời ...'"
      />
    </div>
    <Textarea
      ref="chatInputRef"
      autofocus
      v-model="userInput"
      placeholder="Anh trai hôm nay muốn ăn gì nào?"
      @keyup.ctrl.enter="makeRequest"
      class="w-full"
    />
    <span class="text-xs text-500">Ctrl + Enter để gửi nhé</span>
  </div>
</template>

<style lang="css" scoped>
.chatWrapper {
  display: block;
  min-height: calc(100vh - 300px);
  max-height: calc(100vh - 300px);
  overflow-y: auto;
  border-radius: 8px;
  margin-top: 3rem;
}

.message {
  border: solid 1px rgb(223, 217, 217);
  border-radius: 16px;
  padding: 0 1rem;
  background-color: white;
  width: fit-content;
  max-width: 80%;
  margin-bottom: 1rem;
}

.message.from-user {
  margin-left: auto;
}
</style>
