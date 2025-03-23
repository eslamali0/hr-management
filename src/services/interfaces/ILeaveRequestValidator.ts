export interface ILeaveRequestValidator {
  validateRequestDates(
    userId: number,
    startDate: Date,
    endDate: Date,
    requestIdToExclude?: number
  ): Promise<void>
  validateLeaveBalance(requestedDays: number, userBalance: number): void
}
