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
import { RequestStatus } from '../../constants/requestStatus'
import { IHourRequestValidator } from '../interfaces/IHourRequestValidator'

@injectable()
export class HourRequestService implements IHourRequestService {
  constructor(
    @inject(TYPES.HourRequestRepository)
    private readonly hourRequestRepository: IHourRequestRepository,
    @inject(TYPES.HourRequestValidator)
    private readonly hourRequestValidator: IHourRequestValidator,
    @inject(TYPES.UserRepository)
    private readonly userRepository: IUserRepository
  ) {}

  // Common method for both submit and update operations
  private async validateAndPrepareRequest(
    userId: number,
    requestData: Partial<HourRequest>,
    existingRequest?: HourRequest,
    requestId?: number
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

    // Validate date format
    if (isNaN(requestDate.getTime())) {
      throw new ValidationError('Invalid date format')
    }

    // Get requested hours from input or existing request
    const requestedHours =
      requestData.requestedHours !== undefined
        ? Number(requestData.requestedHours)
        : existingRequest?.requestedHours

    if (!requestedHours) {
      throw new ValidationError('Requested hours are required')
    }

    // Validate date (checks if it's in the future)
    // For updates, we need to exclude the current request from the validation
    if (
      !existingRequest ||
      (existingRequest &&
        requestData.date &&
        existingRequest.date.getTime() !== requestDate.getTime())
    ) {
      await this.hourRequestValidator.validateRequestDates(
        userId,
        requestDate,
        requestId
      )
    }

    // Validate hour balance
    this.hourRequestValidator.validateHourBalance(
      requestedHours,
      user.monthlyHourBalance
    )

    // Prepare the request object
    return {
      ...requestData,
      date: requestDate,
      id: existingRequest?.id || undefined,
      requestedHours,
      status: existingRequest ? existingRequest.status : RequestStatus.PENDING,
    } as HourRequest
  }

  async submitHourRequest(
    userId: number,
    requestData: Partial<HourRequest>
  ): Promise<HourRequest> {
    const request = await this.validateAndPrepareRequest(userId, requestData)
    return this.hourRequestRepository.create(request)
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

    // Check if the request date is in the past - do this check BEFORE checking status
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const requestDate = new Date(existingRequest.date)
    requestDate.setHours(0, 0, 0, 0)

    if (requestDate < today) {
      throw new ValidationError('Cannot modify past hour requests')
    }

    // Only check status after confirming the request is not in the past
    if (existingRequest.status !== RequestStatus.PENDING) {
      throw new BadRequestError('Only pending requests can be updated')
    }

    // Validate and prepare the updated request
    const updatedRequest = await this.validateAndPrepareRequest(
      userId,
      requestData,
      existingRequest,
      requestId
    )

    // Update the request
    await this.hourRequestRepository.update(updatedRequest)
  }

  async approveHourRequest(requestId: number): Promise<void> {
    const request = await this.hourRequestRepository.findById(requestId)
    if (!request) {
      throw new NotFoundError('Hour request not found')
    }

    if (request.status !== RequestStatus.PENDING) {
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

    if (request.status !== RequestStatus.PENDING) {
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
    return this.hourRequestRepository.findByStatus(RequestStatus.PENDING)
  }

  async getUserRequests(userId: number): Promise<Partial<HourRequest>[]> {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new NotFoundError('User not found')
    }

    return this.hourRequestRepository.findByUserId(userId)
  }

  async deleteOwnHourRequest(userId: number, requestId: number): Promise<void> {
    const request = await this.hourRequestRepository.findById(requestId)

    if (!request) {
      throw new NotFoundError('Hour request not found')
    }

    if (request.userId !== userId) {
      throw new ForbiddenError('You can only delete your own requests')
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestError('Only pending requests can be deleted')
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const requestDate = new Date(request.date)
    requestDate.setHours(0, 0, 0, 0)

    if (requestDate < today) {
      throw new BadRequestError('Cannot delete past requests')
    }

    await this.hourRequestRepository.delete(requestId)
  }
}
