import type { WorkLog } from '@/models/work-log'

export interface WorkLogService {
  createOrUpdate: (workLog: WorkLog) => Promise<void>
  getAll: (month: number) => Promise<WorkLog[]>
  delete: (date: string) => Promise<void>
}

class WorkLogServiceByLocalStorage implements WorkLogService {
  username = 'lampv'
  constructor() {
    if (!localStorage.getItem(this.username)) {
      localStorage.setItem(this.username, JSON.stringify([]))
    }
  }
  delete(date: string) {
    const items: WorkLog[] = JSON.parse(localStorage.getItem(this.username) || '[]')
    const foundItemIndex = items.findIndex((item) => item.date === date)
    if (foundItemIndex > -1) {
      items.splice(foundItemIndex, 1)
      console.log('delete work log on ' + date)
    } else {
      console.log('work log not found on ' + date)
    }

    localStorage.setItem(this.username, JSON.stringify(items))
    return Promise.resolve()
  }

  createOrUpdate(workLog: WorkLog) {
    const items: WorkLog[] = JSON.parse(localStorage.getItem(this.username) || '[]')
    const foundItem = items.find((item) => item.date === workLog.date)
    if (foundItem) {
      foundItem.task = workLog.task
      console.log('updated work log', workLog)
    } else {
      workLog.createdAt = new Date().toISOString()
      items.push(workLog)
      console.log('create new work log', workLog)
    }

    localStorage.setItem(this.username, JSON.stringify(items))
    return Promise.resolve()
  }

  getAll(month: number) {
    const data: WorkLog[] = JSON.parse(localStorage.getItem(this.username) || '[]')
    const workLogsInMonth = data.filter((item) => {
      return month + 1 === Number.parseInt(item.date.split('-')[1])
    })
    workLogsInMonth.sort((log1, log2) => {
      return Date.parse(log1.date) - Date.parse(log2.date)
    })
    return Promise.resolve(workLogsInMonth)
  }
}

let workLogService: WorkLogService | null = null

export const getWorkLogService = (): WorkLogService => {
  if (workLogService === null) {
    workLogService = new WorkLogServiceByLocalStorage()
  }

  return workLogService
}
