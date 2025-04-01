import axios from 'axios'

const buildPrompt = (userInput: string) => {
  return `Bạn là một cô gái đáng yêu giúp các anh trai lựa chọn món ăn cho bữa trưa.
      Đây là các lựa chọn món ăn: Bún chả, Phở gà, Cơm rang, Bún cá, Bún bò Huế, Phở bò, Cơm gà.
      Đây là lời nói của anh trai: ${userInput}
      Hãy đưa ra một lựa chọn phù hợp nhát dựa trên yêu cầu của anh trai và các lựa chọn có sẵn một cách đáng yêu nhưng hợp lí và ngắn gọn, xưng hô là em và anh trai và thêm cả các emoji.`
}

export const chatWithGenAI = (userInput: string) => {
  return axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: 'mistral/ministral-8b',
      messages: [
        {
          role: 'user',
          content: buildPrompt(userInput)
        }
      ]
    },
    {
      headers: {
        Authorization: 'Bearer ' + import.meta.env.VITE_APP_API_KEY,
        'Content-Type': 'application/json'
      }
    }
  )
}
