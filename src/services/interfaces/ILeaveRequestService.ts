import { LeaveRequest } from '@prisma/client'
export interface ILeaveRequestService {
  submitLeaveRequest(
    userId: number,
    requestData: Partial<LeaveRequest>
  ): Promise<LeaveRequest>
  approveLeaveRequest(requestId: number): Promise<LeaveRequest>
  rejectLeaveRequest(requestId: number): Promise<LeaveRequest>
  getPendingRequests(): Promise<LeaveRequest[]>
  getUserRequests(userId: number): Promise<LeaveRequest[]>
}
