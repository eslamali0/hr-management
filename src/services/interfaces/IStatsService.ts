export interface IStatsService {
  getRequestCounts(): Promise<{
    leaveRequests: number
    hourRequests: number
  }>
}
