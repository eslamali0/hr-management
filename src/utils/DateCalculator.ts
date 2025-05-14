import { DateTime } from 'luxon'

export class DateCalculator {
  static calculateBusinessDays(startDate: DateTime, endDate: DateTime): number {
    let days = 0
    let currentDate = startDate

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.weekday
      if (dayOfWeek !== 5 && dayOfWeek !== 6) {
        days++
      }
      currentDate = currentDate.plus({ days: 1 })
    }
    return days
  }

  static normalizeToUTCStartOfDay(dateInput: string | Date): DateTime {
    let dt: DateTime

    if (typeof dateInput === 'string') {
      dt = DateTime.fromISO(dateInput)
    } else {
      dt = DateTime.fromJSDate(dateInput)
    }

    return DateTime.utc(dt.year, dt.month, dt.day)
  }
}
