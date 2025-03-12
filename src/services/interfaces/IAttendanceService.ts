import { Attendance } from '@prisma/client'

export interface IAttendanceService {
  markAttendance(
    userId: number,
    status: 'Present' | 'On_Leave' | 'Hourly_Leave'
  ): Promise<Attendance>
  getCurrentAttendance(userId: number): Promise<Attendance | null>
  processDailyAttendance(): Promise<void>
}
