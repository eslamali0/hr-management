import { inject, injectable } from 'inversify'
import { TYPES } from '../../../config/types'
import prisma from '../../../lib/prisma'
import { RequestStatus } from '../../../constants/requestStatus'
import { IHourRequestRepository } from '../../../repositories/interfaces/IHourRequestRepository'
import { ILeaveRequestRepository } from '../../../repositories/interfaces/ILeaveRequestRepository'
import logger from '../../../config/logger'

@injectable()
export class PendingRequestProcessor {
  constructor(
    @inject(TYPES.HourRequestRepository)
    private readonly hourRequestRepository: IHourRequestRepository,
    @inject(TYPES.LeaveRequestRepository)
    private readonly leaveRequestRepository: ILeaveRequestRepository
  ) {}

  async processPendingRequests(): Promise<void> {
    const cutoffDate = new Date()
    cutoffDate.setHours(cutoffDate.getHours() - 48)

    // Process hour requests
    await this.processPendingHourRequests(cutoffDate)

    // Process leave requests
    await this.processPendingLeaveRequests(cutoffDate)
  }

  private async processPendingHourRequests(cutoffDate: Date): Promise<void> {
    const oldPendingHourRequests = await prisma.hourRequest.findMany({
      where: {
        status: RequestStatus.PENDING,
        createdAt: {
          lt: cutoffDate,
        },
      },
    })

    logger.info(
      `Found ${oldPendingHourRequests.length} hour requests to auto-reject`
    )

    // Reject each request
    for (const request of oldPendingHourRequests) {
      try {
        await this.hourRequestRepository.rejectRequest(request.id)
        logger.info(`Auto-rejected hour request ID: ${request.id}`)
      } catch (error) {
        logger.error(
          `Failed to auto-reject hour request ID: ${request.id}`,
          error
        )
      }
    }
  }

  private async processPendingLeaveRequests(cutoffDate: Date): Promise<void> {
    // Find all leave requests that are pending and older than the cutoff date
    const oldPendingLeaveRequests = await prisma.leaveRequest.findMany({
      where: {
        status: RequestStatus.PENDING,
        createdAt: {
          lt: cutoffDate,
        },
      },
    })

    logger.info(
      `Found ${oldPendingLeaveRequests.length} leave requests to auto-reject`
    )

    // Reject each request
    for (const request of oldPendingLeaveRequests) {
      try {
        await this.leaveRequestRepository.update(request.id, {
          status: RequestStatus.REJECTED,
        })
        logger.info(`Auto-rejected leave request ID: ${request.id}`)
      } catch (error) {
        logger.error(
          `Failed to auto-reject leave request ID: ${request.id}`,
          error
        )
      }
    }
  }
}
