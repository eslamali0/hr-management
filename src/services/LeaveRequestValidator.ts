import { DateCalculator } from '../utils/DateCalculator'
import { ILeaveRequestRepository } from '../repositories/interfaces/ILeaveRequestRepository'
import { ValidationError } from '../utils/errors'
import { inject, injectable } from 'inversify'
import { TYPES } from '../config/types'
import { ILeaveRequestValidator } from './interfaces/ILeaveRequestValidator'

@injectable()
export class LeaveRequestValidator implements ILeaveRequestValidator {
  constructor(
    @inject(TYPES.LeaveRequestRepository)
    private readonly leaveRequestRepository: ILeaveRequestRepository
  ) {}

  async validateRequestDates(
    userId: number,
    startDate: Date,
    endDate: Date,
    requestIdToExclude?: number
  ): Promise<void> {
    DateCalculator.validateDateRange(startDate, endDate)

    const overlappingRequests =
      await this.leaveRequestRepository.findOverlappingRequests(
        userId,
        startDate,
        endDate
      )

    // For updates, exclude the current request from overlap check
    const filteredRequests = requestIdToExclude
      ? overlappingRequests.filter(
          (request) => request.id !== requestIdToExclude
        )
      : overlappingRequests

    if (filteredRequests.length > 0) {
      throw new ValidationError(
        'You already have a leave request for this date range'
      )
    }
  }

  validateLeaveBalance(requestedDays: number, userBalance: number): void {
    if (requestedDays <= 0) {
      throw new ValidationError(
        'Leave request must include at least one business day'
      )
    }

    if (requestedDays > userBalance) {
      throw new ValidationError('Insufficient leave balance')
    }
  }
}
