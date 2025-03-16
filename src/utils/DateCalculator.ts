import { ValidationError } from './errors'

export class DateCalculator {
  static calculateBusinessDays(startDate: Date, endDate: Date): number {
    let days = 0
    const current = new Date(startDate)
    const end = new Date(endDate)

    while (current <= end) {
      const dayOfWeek = current.getDay()
      if (dayOfWeek !== 5 && dayOfWeek !== 6) {
        days++
      }
      current.setDate(current.getDate() + 1)
    }
    return days
  }

  static validateDateRange(startDate: Date, endDate: Date): void {
    if (startDate > endDate) {
      throw new ValidationError('Start date must be before end date')
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (startDate < today) {
      throw new ValidationError('Cannot modify past leave requests')
    }
  }
}
