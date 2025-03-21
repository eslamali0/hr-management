export interface ILeaveRequestValidator {
  validateRequestDates(
    userId: number,
    startDate: Date,
    endDate: Date
  ): Promise<void>
  validateLeaveBalance(requestedDays: number, userBalance: number): void
}
