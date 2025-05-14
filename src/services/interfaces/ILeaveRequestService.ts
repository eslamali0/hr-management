import { LeaveDayType } from '../../constants/leaveDayType'
import { LeaveRequest } from '@prisma/client'
export interface ILeaveRequestService {
  submitLeaveRequest(
    userId: number,
    data: {
      startDate: string | Date
      endDate: string | Date
      reason?: string
      dayType: LeaveDayType
    }
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
    data: {
      startDate?: string | Date
      endDate?: string | Date
      reason?: string
      dayType?: LeaveDayType
    }
  ): Promise<void>

  // New methods for user request management
  deleteOwnLeaveRequest(userId: number, requestId: number): Promise<void>
  updateLeaveRequest(userId: number, requestId: number, data: any): Promise<any>
}
