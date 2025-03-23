export interface IHourRequestValidator {
  validateRequestDates(
    userId: number,
    date: Date,
    requestId?: number
  ): Promise<void>
  validateHourBalance(requestedHours: number, userBalance: number): void
}
