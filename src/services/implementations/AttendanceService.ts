import { inject, injectable } from 'inversify'
import { IAttendanceService } from '../interfaces/IAttendanceService'
import { Attendance } from '@prisma/client'
import { TYPES } from '../../config/types'
import { IAttendanceRepository } from '../../repositories/interfaces/IAttendanceRepository'
import { IAttendanceProcessor } from '../interfaces/IAttendanceProcessor'

@injectable()
export class AttendanceService implements IAttendanceService {
  constructor(
    @inject(TYPES.AttendanceRepository)
    private readonly attendanceRepository: IAttendanceRepository,
    @inject(TYPES.LeaveAttendanceProcessor)
    private readonly leaveProcessor: IAttendanceProcessor,
    @inject(TYPES.HourlyLeaveProcessor)
    private readonly hourlyLeaveProcessor: IAttendanceProcessor,
    @inject(TYPES.DefaultAttendanceProcessor)
    private readonly defaultProcessor: IAttendanceProcessor
  ) {}

  async getCurrentAttendance(userId: number): Promise<Attendance | null> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return await this.attendanceRepository.findAttendance(userId, today)
  }

  async processDailyAttendance(): Promise<void> {
    const date = new Date()
    const today = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    )

    // Skip weekends (5 = Friday, 6 = Saturday in your system)
    const dayOfWeek = today.getDay()
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      return // No processing needed for weekends
    }

    console.log('Processing attendance for:', today)

    try {
      // Track which users have been processed
      let processedUserIds = new Set<number>()

      // Process in order of priority without transaction
      processedUserIds = await this.leaveProcessor.process(
        today,
        processedUserIds
      )
      console.log('Leave processor completed')

      processedUserIds = await this.hourlyLeaveProcessor.process(
        today,
        processedUserIds
      )
      console.log('Hourly leave processor completed')

      await this.defaultProcessor.process(today, processedUserIds)
      console.log('Default processor completed')
    } catch (error) {
      console.error('Error during attendance processing:', error)
      throw error
    }
  }

  async getDailyStatus(
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
  }> {
    return await this.attendanceRepository.getDailyStatus(page, limit)
  }
}
