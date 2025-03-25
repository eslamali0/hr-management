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
}
