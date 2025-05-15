import { inject, injectable } from 'inversify'
import { TYPES } from '../../../config/types'
import prisma from '../../../lib/prisma'
import { IAttendanceProcessor } from '../../interfaces/IAttendanceProcessor'
import { IAttendanceRepository } from '../../../repositories/interfaces/IAttendanceRepository'
import { RequestStatus } from '../../../constants/requestStatus'
import { AttendanceStatus } from '../../../constants/attendanceStatus'
import { LeaveDayType } from '../../../constants/leaveDayType'

@injectable()
export class LeaveAttendanceProcessor implements IAttendanceProcessor {
  constructor(
    @inject(TYPES.AttendanceRepository)
    private readonly attendanceRepository: IAttendanceRepository
  ) {}

  async process(
    date: Date,
    processedUserIds: Set<number>
  ): Promise<Set<number>> {
    const leaveRequests = await prisma.leaveRequest.findMany({
      where: {
        status: RequestStatus.APPROVED,
        startDate: { lte: date },
        endDate: { gte: date },
      },
      select: {
        userId: true,
        dayType: true,
      },
    })

    // Process each user with an approved leave
    for (const request of leaveRequests) {
      if (!processedUserIds.has(request.userId)) {
        let statusToSet = AttendanceStatus.ANNUAL_LEAVE

        if (request.dayType === LeaveDayType.HALF_DAY) {
          statusToSet = AttendanceStatus.HALF_DAY
        }

        await this.attendanceRepository.upsertAttendance(
          request.userId,
          date,
          statusToSet
        )
        processedUserIds.add(request.userId)
      }
    }

    return processedUserIds
  }
}
