import { Attendance } from '@prisma/client'
import { IBaseRepository } from './IBaseRepository'

export interface IAttendanceRepository extends IBaseRepository<Attendance> {
  // findByUserId(userId: number): Promise<Attendance | null>
}
