import { inject, injectable } from 'inversify'
import { TYPES } from '../../../config/types'
import prisma from '../../../lib/prisma'
import { IAttendanceProcessor } from '../../interfaces/IAttendanceProcessor'
import { IAttendanceRepository } from '../../../repositories/interfaces/IAttendanceRepository'
import { RequestStatus } from '../../../constants/requestStatus'
import { UserRole } from '../../../constants/userRoles'
import { AttendanceStatus } from '../../../constants/attendanceStatus'

@injectable()
export class HourlyLeaveProcessor implements IAttendanceProcessor {
  constructor(
    @inject(TYPES.AttendanceRepository)
    private readonly attendanceRepository: IAttendanceRepository
  ) {}

  async process(
    date: Date,
    processedUserIds: Set<number>
  ): Promise<Set<number>> {
    const hourRequests = await prisma.hourRequest.findMany({
      where: {
        status: RequestStatus.APPROVED,
        date: date,
        user: {
          role: UserRole.USER,
        },
      },
    })

    // Process each user with an approved hourly leave
    for (const request of hourRequests) {
      if (!processedUserIds.has(request.userId)) {
        await this.attendanceRepository.upsertAttendance(
          request.userId,
          date,
          AttendanceStatus.PERMISSION
        )
        processedUserIds.add(request.userId)
      }
    }

    return processedUserIds
  }
}
