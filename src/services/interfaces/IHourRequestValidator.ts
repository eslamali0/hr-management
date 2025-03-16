export interface IHourRequestValidator {
  validateRequestDates(userId: number, date: Date): Promise<void>
  validateHourBalance(requestedHours: number, userBalance: number): void
}
