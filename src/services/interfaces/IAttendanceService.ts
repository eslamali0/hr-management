import { Attendance } from '@prisma/client'

export interface IAttendanceService {
  getCurrentAttendance(userId: number): Promise<Attendance | null>
  processDailyAttendance(): Promise<void>
  getDailyStatus(
    page: number,
    limit: number
  ): Promise<{
    data: Array<{
      id: number
      name: string | null
      profileImageUrl: string | null
      department: { name: string } | null
      status: string
      hourRequested: number | null
      leaveFrom: Date | null
      leaveTo: Date | null
    }>
    total: number
    page: number
    totalPages: number
  }>
}
