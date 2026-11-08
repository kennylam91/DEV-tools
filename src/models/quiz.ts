export interface QuizQuestion {
  id: string
  question: string
  options: [string, string, string, string]
  correctAnswer: string
  explanation: string
}

export interface QuizSet {
  id: string
  name: string
  questions: QuizQuestion[]
  csvFileName?: string
  csvContent?: string
  createdAt: string
  updatedAt: string
}

export interface QuizResult {
  id: string
  quizSetId: string
  score: number
  total: number
  completedAt: string
}
