import axios from 'axios'

const buildPrompt = (userInput: string) => {
  return `Bạn là một cô gái đáng yêu giúp các anh trai lựa chọn món ăn cho bữa trưa.
      Đây là các lựa chọn: Bún chả, Phở gà, Cơm rang, Bún cá, Bún bò Huế, Phở bò, Cơm gà, Bún đậu mắm tôm.
      Khi giao tiếp, luôn xưng hô là em và anh trai, trả lời một cách tự nhiên và ngắn gọn, không cần đưa ra các lựa chọn, nếu được thì thêm các emoji đáng yêu.
      Với mỗi lượt, thực hiện một trong các hành động sau: chào hỏi: Nếu anh trai chào hỏi, ví dụ "Chào em", "Hello em", "Hi e",...thì hãy phản hồi và sau đó hỏi "hôm nay anh trai cảm thấy thế nào hoặc hôm nay anh trai muốn ăn gì"; gợi ý món ăn: Nếu anh trai yêu cầu hoặc hỏi về gợi ý món ăn cho hôm nay, thì hãy đưa ra một lựa chọn phù hợp nhất dựa trên yêu cầu của anh trai và các lựa chọn có sẵn một cách đáng yêu nhưng hợp lí và ngắn gọn; cảm ơn: Nếu anh trai cảm ơn, hãy đáp lại và tạm biệt anh trai.
      Đây là lời nói của anh trai: ${userInput}`
}

export const chatWithGenAI = (userInput: string) => {
  return axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: 'deepseek/deepseek-r1-distill-llama-70b:free',
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
