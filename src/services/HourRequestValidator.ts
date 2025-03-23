import { TYPES } from '../config/types'
import { IHourRequestRepository } from '../repositories/interfaces/IHourRequestRepository'
import { ValidationError } from '../utils/errors'
import { inject, injectable } from 'inversify'
import { IHourRequestValidator } from './interfaces/IHourRequestValidator'

@injectable()
export class HourRequestValidator implements IHourRequestValidator {
  constructor(
    @inject(TYPES.HourRequestRepository)
    private readonly hourRequestRepository: IHourRequestRepository
  ) {}

  async validateRequestDates(
    userId: number,
    date: Date,
    requestId?: number
  ): Promise<void> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (date < today) {
      throw new ValidationError('Cannot request or modify hours for past days')
    }

    const existingRequest =
      await this.hourRequestRepository.findByUserIdAndDate(userId, date)

    if (existingRequest && (!requestId || existingRequest.id !== requestId)) {
      throw new ValidationError('Hour request already exists or this date')
    }
  }

  validateHourBalance(requestedHours: number, userBalance: number): void {
    if (requestedHours <= 0) {
      throw new ValidationError('Requested hours must be greater than 0')
    }

    if (requestedHours > userBalance) {
      throw new ValidationError('Insufficient hour balance')
    }
  }
}
