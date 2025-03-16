import { LeaveRequest } from '../../types'

export interface ILeaveRequestRepository {
  findByUserId(
    userId: number
  ): Promise<
    Pick<
      LeaveRequest,
      'id' | 'startDate' | 'endDate' | 'status' | 'requestedDays' | 'reason'
    >[]
  >
  create(request: Omit<LeaveRequest, 'id'>): Promise<void>
  findById(id: number): Promise<LeaveRequest | null>
  update(request: LeaveRequest): Promise<void>
  delete(id: number): Promise<void>
  findByStatus(
    status: 'pending' | 'approved' | 'rejected'
  ): Promise<
    Pick<
      LeaveRequest,
      'id' | 'startDate' | 'endDate' | 'status' | 'requestedDays'
    >[]
  >
  findPendingRequests(): Promise<LeaveRequest[]>
  findOverlappingRequests(
    userId: number,
    startDate: Date,
    endDate: Date
  ): Promise<LeaveRequest[]>
  approveLeaveRequestWithTransaction(
    requestId: number,
    userId: number,
    newBalance: number
  ): Promise<void>
  count(): Promise<number>
}
