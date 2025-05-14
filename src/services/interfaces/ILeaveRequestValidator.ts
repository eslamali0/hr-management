import { LeaveDayType } from '../../constants/leaveDayType'

export interface ILeaveRequestValidator {
  validateRequestDates(
    userId: number,
    startDate: Date,
    endDate: Date,
    dayType: LeaveDayType,
    requestIdToExclude?: number
  ): Promise<void>
  validateLeaveBalance(requestedDays: number, userBalance: number): void
}
