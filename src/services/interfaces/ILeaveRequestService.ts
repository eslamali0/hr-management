import { LeaveRequest } from '@prisma/client'
export interface ILeaveRequestService {
  submitLeaveRequest(
    userId: number,
    requestData: Partial<LeaveRequest>
  ): Promise<void>
  approveLeaveRequest(requestId: number): Promise<void>
  rejectLeaveRequest(requestId: number): Promise<void>
  getPendingRequests(): Promise<
    Pick<
      LeaveRequest,
      'id' | 'startDate' | 'endDate' | 'status' | 'requestedDays'
    >[]
  >
  getUserRequests(
    userId: number
  ): Promise<
    Pick<
      LeaveRequest,
      'id' | 'startDate' | 'endDate' | 'status' | 'requestedDays' | 'reason'
    >[]
  >
  updateLeaveRequest(
    userId: number,
    requestId: number,
    requestData: Partial<LeaveRequest>
  ): Promise<void>

  // New methods for user request management
  deleteOwnLeaveRequest(userId: number, requestId: number): Promise<void>
  updateOwnLeaveRequest(
    userId: number,
    requestId: number,
    data: any
  ): Promise<any>
}
