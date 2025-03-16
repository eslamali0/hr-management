import { DateCalculator } from '../utils/DateCalculator'
import { ILeaveRequestRepository } from '../repositories/interfaces/ILeaveRequestRepository'
import { ValidationError } from '../utils/errors'
import { inject, injectable } from 'inversify'
import { TYPES } from '../config/types'
import { ILeaveRequestValidator } from './interfaces/ILeaveRequestValidator'
import { IUserRepository } from '../repositories/interfaces/IUserRepository'

@injectable()
export class LeaveRequestValidator implements ILeaveRequestValidator {
  constructor(
    @inject(TYPES.LeaveRequestRepository)
    private readonly leaveRequestRepository: ILeaveRequestRepository,
    @inject(TYPES.UserRepository)
    private readonly userRepository: IUserRepository
  ) {}

  async validateRequestDates(
    userId: number,
    startDate: Date,
    endDate: Date
  ): Promise<void> {
    DateCalculator.validateDateRange(startDate, endDate)

    const overlappingRequests =
      await this.leaveRequestRepository.findOverlappingRequests(
        userId,
        startDate,
        endDate
      )

    if (overlappingRequests.length > 0) {
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
