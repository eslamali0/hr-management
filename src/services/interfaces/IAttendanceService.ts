import { Attendance } from '@prisma/client'

export interface IAttendanceService {
  getCurrentAttendance(userId: number): Promise<Attendance | null>
  processDailyAttendance(): Promise<void>
}
