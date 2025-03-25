export interface IAttendanceProcessor {
  process(date: Date, processedUserIds: Set<number>): Promise<Set<number>>
}
