import { ILeaveRequestService } from '../interfaces/ILeaveRequestService'
import { ILeaveRequestRepository } from '../../repositories/interfaces/ILeaveRequestRepository'
import { IUserRepository } from '../../repositories/interfaces/IUserRepository'
import { NotFoundError } from '../../utils/errors'
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

  async submitLeaveRequest(
    userId: number,
    requestData: Partial<LeaveRequest>
  ): Promise<LeaveRequest> {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }

    const request = {
      ...requestData,
      status: 'pending',
      user: { id: userId } as any,
    } as LeaveRequest

    return this.leaveRequestRepository.create(request)
  }

  async approveLeaveRequest(requestId: number): Promise<LeaveRequest> {
    const request = await this.leaveRequestRepository.findById(requestId)
    if (!request) {
      throw new Error('Leave request not found')
    }

    if (request.type === 'annual') {
      const user = await this.userRepository.findById(request.userId)
      if (!user || user.annualLeaveBalance < (request.requestedDays || 0)) {
        throw new Error('Insufficient leave balance')
      }
      await this.userRepository.updateAnnualLeaveBalance(
        request.userId,
        user.annualLeaveBalance - (request.requestedDays || 0)
      )
    }

    request.status = 'approved'
    return this.leaveRequestRepository.update(request)
  }

  async rejectLeaveRequest(requestId: number): Promise<LeaveRequest> {
    const request = await this.leaveRequestRepository.findById(requestId)
    if (!request) {
      throw new Error('Leave request not found')
    }

    request.status = 'rejected'
    return this.leaveRequestRepository.update(request)
  }

  async getPendingRequests(): Promise<LeaveRequest[]> {
    return this.leaveRequestRepository.findByStatus('pending')
  }

  async getUserRequests(userId: number): Promise<LeaveRequest[]> {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new NotFoundError('User not found')
    }

    return this.leaveRequestRepository.findByUserId(userId)
  }
}
