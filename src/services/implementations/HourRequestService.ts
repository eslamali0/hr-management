import { inject, injectable } from 'inversify'
import { TYPES } from '../../config/types'
import { HourRequest } from '@prisma/client'
import { IUserRepository } from '../../repositories/interfaces/IUserRepository'
import { IHourRequestRepository } from '../../repositories/interfaces/IHourRequestRepository'
import { NotFoundError, ValidationError } from '../../utils/errors'
import { IHourRequestService } from '../interfaces/IHourRequestService'

@injectable()
export class HourRequestService implements IHourRequestService {
  constructor(
    @inject(TYPES.HourRequestRepository)
    private readonly hourRequestRepository: IHourRequestRepository,
    @inject(TYPES.UserRepository)
    private readonly userRepository: IUserRepository
  ) {}

  async submitHourRequest(
    userId: number,
    requestData: Partial<HourRequest>
  ): Promise<void> {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new NotFoundError('User not found')
    }

    if (!requestData.date) {
      throw new ValidationError('Date is required')
    }

    const requestDate = new Date(requestData.date)
    if (isNaN(requestDate.getTime())) {
      throw new ValidationError('Invalid date format')
    }

    // Check if date is in the past
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (requestDate < today) {
      throw new ValidationError('Cannot submit hour request for past dates')
    }

    if (
      !requestData.requestedHours ||
      Number(requestData.requestedHours) <= 0
    ) {
      throw new ValidationError('Requested hours must be greater than 0')
    }

    if (requestData.requestedHours > user.monthlyHourBalance) {
      throw new ValidationError(
        `Insufficient hour balance. Available: ${user.monthlyHourBalance} hours`
      )
    }

    // Check for existing request on the same date
    const existingRequest =
      await this.hourRequestRepository.findByUserIdAndDate(userId, requestDate)
    if (existingRequest) {
      throw new ValidationError('An hour request already exists for this date')
    }

    const request = {
      ...requestData,
      date: requestDate,
      status: 'pending',
      userId,
    } as HourRequest

    this.hourRequestRepository.create(request)
  }

  async approveHourRequest(requestId: number): Promise<void> {
    const request = await this.hourRequestRepository.findById(requestId)
    if (!request) {
      throw new NotFoundError('Hour request not found')
    }

    if (request.status !== 'pending') {
      throw new ValidationError('Request has already been processed')
    }

    const user = await this.userRepository.findById(request.userId)
    if (!user) {
      throw new NotFoundError('User not found')
    }

    // Recheck balance at approval time
    if (user.monthlyHourBalance < request.requestedHours) {
      throw new ValidationError(
        `Insufficient hour balance. Available: ${user.monthlyHourBalance} hours, Requested: ${request.requestedHours} hours`
      )
    }

    // Calculate new balance with precision handling
    const newBalance = Number(
      (
        Number(user.monthlyHourBalance) - Number(request.requestedHours)
      ).toFixed(2)
    )

    await this.hourRequestRepository.approveRequestWithTransaction(
      request.id,
      request.userId,
      newBalance
    )
  }

  async rejectHourRequest(requestId: number): Promise<void> {
    const request = await this.hourRequestRepository.findById(requestId)
    if (!request) {
      throw new NotFoundError('Hour request not found')
    }

    if (request.status !== 'pending') {
      throw new ValidationError('Request has already been processed')
    }

    await this.hourRequestRepository.rejectRequest(requestId)
  }

  async getPendingRequests(): Promise<
    (Partial<HourRequest> & {
      user: {
        name: string | null
        department: { name: string } | null
      }
    })[]
  > {
    return this.hourRequestRepository.findByStatus('pending')
  }

  async getUserRequests(userId: number): Promise<Partial<HourRequest>[]> {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new NotFoundError('User not found')
    }

    return this.hourRequestRepository.findByUserId(userId)
  }
}
