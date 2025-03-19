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
  private async validateAndPrepareRequest(
    userId: number,
    requestData: Partial<LeaveRequest>,
    existingRequest?: LeaveRequest
  ): Promise<LeaveRequest> {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new NotFoundError('User not found')
    }

    // For updates, we use existing values if not provided in the update
    const startDate = requestData.startDate
      ? new Date(requestData.startDate)
      : existingRequest?.startDate

    const endDate = requestData.endDate
      ? new Date(requestData.endDate)
      : existingRequest?.endDate

    if (!startDate || !endDate) {
      throw new ValidationError('Start date and end date are required')
    }

    if (startDate > endDate) {
      throw new ValidationError('Start date must be before end date')
    }

    // Validate dates (checks for overlaps)
    await this.leaveRequestValidator.validateRequestDates(
      userId,
      startDate,
      endDate
    )

    // Calculate business days
    const requestedDays = DateCalculator.calculateBusinessDays(
      startDate,
      endDate
    )

    // Validate leave balance
    this.leaveRequestValidator.validateLeaveBalance(
      requestedDays,
      user.annualLeaveBalance
    )

    /** REFACTOR */
    // Prepare the request object
    return {
      ...(existingRequest || {}),
      ...requestData,
      startDate,
      endDate,
      requestedDays,
      status: existingRequest ? existingRequest.status : RequestStatus.PENDING,
      userId,
    } as LeaveRequest
  }

  async submitLeaveRequest(
    userId: number,
    requestData: Partial<LeaveRequest>
  ): Promise<void> {
    const request = await this.validateAndPrepareRequest(userId, requestData)
    await this.leaveRequestRepository.create(request)
  }

  async updateLeaveRequest(
    userId: number,
    requestId: number,
    requestData: Partial<LeaveRequest>
  ): Promise<void> {
    // Find the existing request
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

    // Validate and prepare the updated request
    const updatedRequest = await this.validateAndPrepareRequest(
      userId,
      requestData,
      existingRequest
    )

    // Update the request
    await this.leaveRequestRepository.update(updatedRequest)
  }

  async approveLeaveRequest(requestId: number): Promise<void> {
    const request = await this.leaveRequestRepository.findById(requestId)
    if (!request) {
      throw new NotFoundError('Leave request not found')
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new ValidationError('Request has already been processed')
    }

    const user = await this.userRepository.findById(request.userId)
    if (!user) {
      throw new NotFoundError('User not found')
    }

    if (user.annualLeaveBalance < (request.requestedDays || 0)) {
      throw new ValidationError('Insufficient leave balance')
    }

    const newBalance = user.annualLeaveBalance - (request.requestedDays || 0)

    // Use transaction to ensure atomicity
    await this.leaveRequestRepository.approveLeaveRequestWithTransaction(
      request.id,
      request.userId,
      newBalance
    )
  }

  async rejectLeaveRequest(requestId: number): Promise<void> {
    const request = await this.leaveRequestRepository.findById(requestId)
    if (!request) {
      throw new NotFoundError('Leave request not found')
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new ValidationError('Request has already been processed')
    }

    request.status = 'rejected'
    this.leaveRequestRepository.update(request)
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
}
