import { inject, injectable } from 'inversify'
import { TYPES } from '../../../config/types'
import prisma from '../../../lib/prisma'
import { IAttendanceProcessor } from '../../interfaces/IAttendanceProcessor'
import { IAttendanceRepository } from '../../../repositories/interfaces/IAttendanceRepository'
import { RequestStatus } from '../../../constants/requestStatus'
import { AttendanceStatus } from '../../../constants/attendanceStatus'

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
    })

    // Process each user with an approved leave
    for (const request of leaveRequests) {
      if (!processedUserIds.has(request.userId)) {
        await this.attendanceRepository.upsertAttendance(
          request.userId,
          date,
          AttendanceStatus.Absent
        )
        processedUserIds.add(request.userId)
      }
    }

    return processedUserIds
  }
}
