import { ILeaveRequestService } from '../interfaces/ILeaveRequestService'
import { ILeaveRequestRepository } from '../../repositories/interfaces/ILeaveRequestRepository'
import { IUserRepository } from '../../repositories/interfaces/IUserRepository'
import { NotFoundError, ValidationError } from '../../utils/errors'
import { inject, injectable } from 'inversify'
import { TYPES } from '../../config/types'
import { LeaveRequest } from '@prisma/client'

@injectable()
export class LeaveRequestService implements ILeaveRequestService {
  constructor(
    @inject(TYPES.LeaveRequestRepository)
    private readonly leaveRequestRepository: ILeaveRequestRepository,
    @inject(TYPES.UserRepository)
    private readonly userRepository: IUserRepository
  ) {}

  private calculateBusinessDays(startDate: Date, endDate: Date): number {
    let days = 0
    const current = new Date(startDate)
    const end = new Date(endDate)

    while (current <= end) {
      const dayOfWeek = current.getDay()
      if (dayOfWeek !== 5 && dayOfWeek !== 6) {
        days++
      }
      current.setDate(current.getDate() + 1)
    }
    return days
  }

  async submitLeaveRequest(
    userId: number,
    requestData: Partial<LeaveRequest>
  ): Promise<void> {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new NotFoundError('User not found')
    }

    if (!requestData.startDate || !requestData.endDate) {
      throw new ValidationError('Start date and end date are required')
    }

    const startDate = new Date(requestData.startDate)
    const endDate = new Date(requestData.endDate)

    if (startDate > endDate) {
      throw new ValidationError('Start date must be before end date')
    }

    // Check for overlapping leave requests
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

    const requestedDays = this.calculateBusinessDays(startDate, endDate)

    if (requestedDays <= 0)
      throw new ValidationError(
        'Leave request must include at least one business day '
      )

    if (requestedDays > user.annualLeaveBalance) {
      throw new ValidationError('Insufficient leave balance')
    }

    const request = {
      ...requestData,
      startDate,
      endDate,
      requestedDays,
      status: 'Pending',
      userId,
    } as LeaveRequest

    await this.leaveRequestRepository.create(request)
  }

  async approveLeaveRequest(requestId: number): Promise<void> {
    const request = await this.leaveRequestRepository.findById(requestId)
    if (!request) {
      throw new NotFoundError('Leave request not found')
    }

    if (request.status !== 'pending') {
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

    if (request.status !== 'pending') {
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
    return this.leaveRequestRepository.findByStatus('pending')
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
