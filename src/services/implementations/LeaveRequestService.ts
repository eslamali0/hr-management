import { ILeaveRequestService } from '../interfaces/ILeaveRequestService'
import { ILeaveRequestRepository } from '../../repositories/interfaces/ILeaveRequestRepository'
import { IUserRepository } from '../../repositories/interfaces/IUserRepository'
import {
  NotFoundError,
  ValidationError,
  BadRequestError,
  ForbiddenError,
} from '../../utils/errors'
import { inject, injectable } from 'inversify'
import { TYPES } from '../../config/types'
import { LeaveRequest } from '@prisma/client'
import { ILeaveRequestValidator } from '../interfaces/ILeaveRequestValidator'
import { DateCalculator } from '../../utils/DateCalculator'
import { RequestStatus } from '../../constants/requestStatus'
import { LeaveDayType } from '../../constants/leaveDayType'

@injectable()
export class LeaveRequestService implements ILeaveRequestService {
  constructor(
    @inject(TYPES.LeaveRequestRepository)
    private readonly leaveRequestRepository: ILeaveRequestRepository,
    @inject(TYPES.UserRepository)
    private readonly userRepository: IUserRepository,
    @inject(TYPES.LeaveRequestValidator)
    private readonly leaveRequestValidator: ILeaveRequestValidator
  ) {}

  // Common method for both submit and update operations
  private async validateAndPrepareRequestData(
    userId: number,
    requestData: {
      startDate: string | Date
      endDate: string | Date
      reason?: string | null
      dayType: LeaveDayType
    },
    existingRequestId?: number
  ): Promise<
    Omit<LeaveRequest, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>
  > {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new NotFoundError('User not found')
    }

    const normalizedStartDate = DateCalculator.normalizeToUTCStartOfDay(
      requestData.startDate
    )
    const normalizedEndDate = DateCalculator.normalizeToUTCStartOfDay(
      requestData.endDate
    )

    // Allow today's date but prevent past dates
    const today = DateCalculator.normalizeToUTCStartOfDay(new Date());
    if (normalizedStartDate.valueOf() < today.valueOf()) {
      throw new ValidationError('Start date cannot be in the past.');
    }

    // Validate that for HALF_DAY, startDate and endDate are the same.
    if (requestData.dayType === LeaveDayType.HALF_DAY) {
      if (!normalizedStartDate.hasSame(normalizedEndDate, 'day')) {
        throw new ValidationError(
          'For half-day requests, start date and end date must be the same day.'
        )
      }
    } else { // FULL_DAY
      if (normalizedEndDate.valueOf() < normalizedStartDate.valueOf()) {
        throw new ValidationError('End date must be on or after start date.')
      }
    }

    let requestedDays: number
    if (requestData.dayType === LeaveDayType.HALF_DAY) {
      requestedDays = 0.5
    } else {
      requestedDays = DateCalculator.calculateBusinessDays(
        normalizedStartDate,
        normalizedEndDate
      )
    }

    if (requestedDays <= 0) {
      throw new ValidationError('Requested days must be greater than 0')
    }

    this.leaveRequestValidator.validateLeaveBalance(
      requestedDays,
      user.annualLeaveBalance
    )

    await this.leaveRequestValidator.validateRequestDates(
      userId,
      normalizedStartDate.toJSDate(),
      normalizedEndDate.toJSDate(),
      requestData.dayType,
      existingRequestId
    )

    return {
      startDate: normalizedStartDate.toJSDate(),
      endDate: normalizedEndDate.toJSDate(),
      reason: requestData.reason ?? null,
      requestedDays,
      dayType: requestData.dayType,
    }
  }

  async submitLeaveRequest(
    userId: number,
    data: {
      startDate: string | Date
      endDate: string | Date
      reason?: string
      dayType: LeaveDayType
    }
  ): Promise<void> {
    const request = await this.validateAndPrepareRequestData(userId, data)

    await this.leaveRequestRepository.create({
      ...request,
      userId,
      status: RequestStatus.PENDING,
    })
  }

  async updateLeaveRequest(
    userId: number,
    requestId: number,
    data: {
      startDate?: string | Date
      endDate?: string | Date
      reason?: string | null
      dayType?: LeaveDayType
    }
  ): Promise<void> {
    const existingRequest = await this.leaveRequestRepository.findById(
      requestId
    )

    if (!existingRequest) {
      throw new NotFoundError('Leave request not found')
    }
    if (existingRequest.userId !== userId) {
      throw new ForbiddenError('You can only update your own requests')
    }
    if (existingRequest.status !== RequestStatus.PENDING) {
      throw new BadRequestError('Only pending requests can be updated')
    }

    const validationData = {
      startDate: data.startDate ?? existingRequest.startDate,
      endDate: data.endDate ?? existingRequest.endDate,
      reason: data.reason ?? existingRequest.reason,
      dayType: data.dayType ?? (existingRequest.dayType as LeaveDayType),
    }

    // Validate and prepare the updated request
    const preparedData = await this.validateAndPrepareRequestData(
      userId,
      validationData,
      requestId
    )

    const updatePayload: Partial<LeaveRequest> = {
      ...preparedData,
    }

    if (data.startDate) updatePayload.startDate = preparedData.startDate
    if (data.endDate) updatePayload.endDate = preparedData.endDate
    if (data.reason) updatePayload.reason = preparedData.reason
    if (data.dayType) updatePayload.dayType = preparedData.dayType

    // Update the request
    await this.leaveRequestRepository.update(requestId, updatePayload)
  }

  async approveLeaveRequest(requestId: number): Promise<void> {
    const request = await this.leaveRequestRepository.findById(requestId)
    if (!request) throw new NotFoundError('Leave request not found')

    if (request.status !== RequestStatus.PENDING)
      throw new ValidationError('Request has already been processed')

    const user = await this.userRepository.findById(request.userId)
    if (!user) {
      throw new NotFoundError('User not found')
    }

    if (user.annualLeaveBalance < (request.requestedDays || 0)) {
      throw new ValidationError('Insufficient leave balance')
    }

    const newBalance = (user.annualLeaveBalance ?? 0) - request.requestedDays

    // Use transaction to ensure atomicity
    await this.leaveRequestRepository.approveLeaveRequest(
      request.id,
      request.userId,
      newBalance
    )
  }

  async rejectLeaveRequest(requestId: number): Promise<void> {
    const request = await this.leaveRequestRepository.findById(requestId)
    if (!request) throw new NotFoundError('Leave request not found')

    if (request.status !== RequestStatus.PENDING)
      throw new ValidationError('Request has already been processed')

    this.leaveRequestRepository.update(requestId, {
      status: RequestStatus.REJECTED,
    } as Partial<LeaveRequest>)
  }

  async getPendingRequests(): Promise<
    Pick<
      LeaveRequest,
      'id' | 'startDate' | 'endDate' | 'status' | 'requestedDays'
    >[]
  > {
    return this.leaveRequestRepository.findByStatus(RequestStatus.PENDING)
  }

  async getUserRequests(
    userId: number
  ): Promise<
    Pick<
      LeaveRequest,
      'id' | 'startDate' | 'endDate' | 'status' | 'requestedDays' | 'reason'
    >[]
  > {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new NotFoundError('User not found')
    }

    return this.leaveRequestRepository.findByUserId(userId)
  }

  async deleteOwnLeaveRequest(
    userId: number,
    requestId: number
  ): Promise<void> {
    // First verify the request belongs to the user
    const request = await this.leaveRequestRepository.findById(requestId)

    if (!request) throw new NotFoundError('Leave request not found')

    if (request.userId !== userId)
      throw new ForbiddenError('You can only delete your own requests')

    if (request.status !== RequestStatus.PENDING)
      throw new BadRequestError('Only pending requests can be deleted')

    await this.leaveRequestRepository.delete(requestId)
  }
}
