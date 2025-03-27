import { AttendanceStatus } from '../../constants/attendanceStatus'
import { Attendance } from '@prisma/client'

export interface IAttendanceRepository {
  upsertAttendance(
    userId: number,
    date: Date,
    status: AttendanceStatus
  ): Promise<Attendance>
  findAttendance(userId: number, date: Date): Promise<Attendance | null>
  createAttendance(
    userId: number,
    date: Date,
    status: AttendanceStatus
  ): Promise<Attendance>
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
