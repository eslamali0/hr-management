import { LeaveDayType } from '../../constants/leaveDayType'
import { RequestStatus } from '../../constants/requestStatus'
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
  create(
    data: Omit<
      LeaveRequest,
      'id' | 'status' | 'createdAt' | 'updatedAt' | 'userId'
    > & { userId: number; status: RequestStatus }
  ): Promise<void>
  findById(id: number): Promise<LeaveRequest | null>
  update(
    id: number,
    data: Partial<
      Omit<LeaveRequest, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
    >
  ): Promise<void>
  delete(id: number): Promise<void>
  findByStatus(
    status:
      | RequestStatus.APPROVED
      | RequestStatus.PENDING
      | RequestStatus.REJECTED
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
    endDate: Date,
    dayType: LeaveDayType
  ): Promise<LeaveRequest[]>
  approveLeaveRequest(
    requestId: number,
    userId: number,
    newBalance: number
  ): Promise<void>
  count(): Promise<number>
}
