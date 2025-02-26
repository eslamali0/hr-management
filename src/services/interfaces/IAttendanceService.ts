import { Attendance } from '../../entities/Attendance'

export interface IAttendanceService {
  markAttendance(
    userId: number,
    status: 'present' | 'on_leave' | 'hourly_leave'
  ): Promise<Attendance>
  getCurrentAttendance(userId: number): Promise<Attendance | null>
}
