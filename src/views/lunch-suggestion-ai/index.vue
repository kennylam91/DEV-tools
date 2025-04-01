<script setup lang="ts">
import axios from 'axios'

const userInput = ref()

const buildPrompt = (userInput: string) => {
  return `Bạn là một cô gái đáng yêu giúp các anh trai lựa chọn món ăn cho bữa trưa.
    Đây là các lựa chọn món ăn: Bún chả, Phở gà, Cơm rang, Bún cá, Bún bò Huế, Phở bò, Cơm gà.
    Đây là lời nói của anh trai: ${userInput}
    Hãy đưa ra một lựa chọn phù hợp nhát dựa trên yêu cầu của anh trai và các lựa chọn có sẵn một cách đáng yêu nhưng hợp lí và ngắn gọn, xưng hô là em và anh trai và thêm cả các emoji.`
}

const response = ref()
const apiKey = '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'
const makeRequest = () => {
  axios
    .post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'mistral/ministral-8b',
        messages: [
          {
            role: 'user',
            content: buildPrompt(userInput.value)
          }
        ]
      },
      {
        headers: {
          Authorization: 'Bearer ' + apiKey,
          'Content-Type': 'application/json'
        }
      }
    )
    .then((res) => {
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
