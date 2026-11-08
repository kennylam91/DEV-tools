import type { QuizResult, QuizSet } from '@/models/quiz'

const QUIZ_SETS_KEY = 'dev-tools.quiz-sets'
const QUIZ_RESULTS_KEY = 'dev-tools.quiz-results'

export interface QuizService {
  getSets: () => QuizSet[]
  saveSet: (quizSet: QuizSet) => void
  deleteSet: (id: string) => void
  saveResult: (result: QuizResult) => void
  getResults: (quizSetId: string) => QuizResult[]
}

class QuizServiceByLocalStorage implements QuizService {
  getSets(): QuizSet[] {
    return this.read<QuizSet[]>(QUIZ_SETS_KEY, [])
  }

  saveSet(quizSet: QuizSet): void {
    const sets = this.getSets()
    const index = sets.findIndex((item) => item.id === quizSet.id)
    if (index === -1) {
      sets.push(quizSet)
    } else {
      sets[index] = quizSet
    }
    this.write(QUIZ_SETS_KEY, sets)
  }

  deleteSet(id: string): void {
    this.write(
      QUIZ_SETS_KEY,
      this.getSets().filter((quizSet) => quizSet.id !== id)
    )
    this.write(
      QUIZ_RESULTS_KEY,
      this.read<QuizResult[]>(QUIZ_RESULTS_KEY, []).filter((result) => result.quizSetId !== id)
    )
  }

  saveResult(result: QuizResult): void {
    const results = this.read<QuizResult[]>(QUIZ_RESULTS_KEY, [])
    results.push(result)
    this.write(QUIZ_RESULTS_KEY, results)
  }

  getResults(quizSetId: string): QuizResult[] {
    return this.read<QuizResult[]>(QUIZ_RESULTS_KEY, [])
      .filter((result) => result.quizSetId === quizSetId)
      .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
  }

  private read<T>(key: string, fallback: T): T {
    const value = localStorage.getItem(key)
    if (!value) return fallback
    try {
      return JSON.parse(value) as T
    } catch {
      return fallback
    }
  }

  private write<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value))
  }
}

let service: QuizService | null = null

export const getQuizService = (): QuizService => {
  if (!service) service = new QuizServiceByLocalStorage()
  return service
}
