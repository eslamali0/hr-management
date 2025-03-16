import { inject, injectable } from 'inversify'
import { TYPES } from '../../config/types'
import { HourRequest } from '@prisma/client'
import { IUserRepository } from '../../repositories/interfaces/IUserRepository'
import { IHourRequestRepository } from '../../repositories/interfaces/IHourRequestRepository'
import {
  NotFoundError,
  ValidationError,
  BadRequestError,
  ForbiddenError,
} from '../../utils/errors'
import { IHourRequestService } from '../interfaces/IHourRequestService'

@injectable()
export class HourRequestService implements IHourRequestService {
  constructor(
    @inject(TYPES.HourRequestRepository)
    private readonly hourRequestRepository: IHourRequestRepository,
    @inject(TYPES.UserRepository)
    private readonly userRepository: IUserRepository
  ) {}

  // Common method for both submit and update operations
  private async validateAndPrepareRequest(
    userId: number,
    requestData: Partial<HourRequest>,
    existingRequest?: HourRequest
  ): Promise<HourRequest> {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new NotFoundError('User not found')
    }

    // For updates, use existing values if not provided in the update
    const requestDate = requestData.date
      ? new Date(requestData.date)
      : existingRequest?.date

    if (!requestDate) {
      throw new ValidationError('Date is required')
    }

    if (isNaN(requestDate.getTime())) {
      throw new ValidationError('Invalid date format')
    }

    // Check if date is in the past
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (requestDate < today) {
      throw new ValidationError('Cannot submit hour request for past dates')
    }

    // Get requested hours from input or existing request
    const requestedHours =
      requestData.requestedHours !== undefined
        ? Number(requestData.requestedHours)
        : existingRequest?.requestedHours

    if (!requestedHours || requestedHours <= 0) {
      throw new ValidationError('Requested hours must be greater than 0')
    }

    if (requestedHours > user.monthlyHourBalance) {
      throw new ValidationError(
        `Insufficient hour balance. Available: ${user.monthlyHourBalance} hours`
      )
    }

    // Check for existing request on the same date (only for new requests or date changes)
    if (
      !existingRequest ||
      (existingRequest &&
        requestData.date &&
        existingRequest.date.getTime() !== requestDate.getTime())
    ) {
      const overlappingRequest =
        await this.hourRequestRepository.findByUserIdAndDate(
          userId,
          requestDate
        )

      if (
        overlappingRequest &&
        (!existingRequest || overlappingRequest.id !== existingRequest.id)
      ) {
        throw new ValidationError(
          'An hour request already exists for this date'
        )
      }
    }

    // Prepare the request object
    return {
      ...(existingRequest || {}),
      ...requestData,
      date: requestDate,
      requestedHours,
      status: existingRequest ? existingRequest.status : 'pending',
      userId,
    } as HourRequest
  }

  async submitHourRequest(
    userId: number,
    requestData: Partial<HourRequest>
  ): Promise<void> {
    const request = await this.validateAndPrepareRequest(userId, requestData)
    await this.hourRequestRepository.create(request)
  }

  async updateHourRequest(
    userId: number,
    requestId: number,
    requestData: Partial<HourRequest>
  ): Promise<void> {
    // Find the existing request
    const existingRequest = await this.hourRequestRepository.findById(requestId)

    if (!existingRequest) {
      throw new NotFoundError('Hour request not found')
    }

    if (existingRequest.userId !== userId) {
      throw new ForbiddenError('You can only update your own requests')
    }

    if (existingRequest.status !== 'pending') {
      throw new BadRequestError('Only pending requests can be updated')
    }

    // Validate and prepare the updated request
    const updatedRequest = await this.validateAndPrepareRequest(
      userId,
      requestData,
      existingRequest
    )

    // Update the request
    await this.hourRequestRepository.update(updatedRequest)
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
