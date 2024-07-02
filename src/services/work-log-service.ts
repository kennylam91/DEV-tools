import type { WorkLog } from '@/models/work-log'

export interface WorkLogService {
  create: (workLog: WorkLog) => void
  getAll: () => WorkLog[]
}

export class WorkLogServiceByLocalStorage implements WorkLogService {
  create(workLog: WorkLog) {
    console.log('create new work log', workLog)
  }

  getAll() {
    return []
  }
}
