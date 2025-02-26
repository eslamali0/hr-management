import { LeaveRequest } from '../../types'
import { IBaseRepository } from './IBaseRepository'

export interface ILeaveRequestRepository extends IBaseRepository<LeaveRequest> {
  findByUserId(userId: number): Promise<LeaveRequest[]>
  findByStatus(
    status: 'pending' | 'approved' | 'rejected'
  ): Promise<LeaveRequest[]>
  create(
    request: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<LeaveRequest>
  findById(id: number): Promise<LeaveRequest | null>
  update(request: LeaveRequest): Promise<LeaveRequest>
  findByStatus(status: string): Promise<LeaveRequest[]>
  findPendingRequests(): Promise<LeaveRequest[]>
}
