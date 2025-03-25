import { inject, injectable } from 'inversify'
import { TYPES } from '../../../config/types'
import prisma from '../../../lib/prisma'
import { IAttendanceProcessor } from '../../interfaces/IAttendanceProcessor'
import { IAttendanceRepository } from '../../../repositories/interfaces/IAttendanceRepository'
import { UserRole } from '../../../constants/userRoles'
import { AttendanceStatus } from '../../../constants/attendanceStatus'

@injectable()
export class DefaultAttendanceProcessor implements IAttendanceProcessor {
  constructor(
    @inject(TYPES.AttendanceRepository)
    private readonly attendanceRepository: IAttendanceRepository
  ) {}

  async process(
    date: Date,
    processedUserIds: Set<number>
  ): Promise<Set<number>> {
    const users = await prisma.user.findMany({
      where: { role: UserRole.USER },
      select: { id: true },
    })

    // Process each user that hasn't been processed yet
    for (const user of users) {
      if (!processedUserIds.has(user.id)) {
        await this.attendanceRepository.upsertAttendance(
          user.id,
          date,
          AttendanceStatus.PRESENT
        )

        processedUserIds.add(user.id)
      }
    }

    return processedUserIds
  }
}
