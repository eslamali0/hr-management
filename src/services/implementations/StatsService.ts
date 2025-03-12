import { inject, injectable } from 'inversify'
import { IStatsService } from '../interfaces/IStatsService'
import { ILeaveRequestRepository } from '../../repositories/interfaces/ILeaveRequestRepository'
import { IHourRequestRepository } from '../../repositories/interfaces/IHourRequestRepository'
import { TYPES } from '../../config/types'

@injectable()
export class StatsService implements IStatsService {
  constructor(
    @inject(TYPES.LeaveRequestRepository)
    private leaveRequestRepository: ILeaveRequestRepository,
    @inject(TYPES.HourRequestRepository)
    private hourRequestRepository: IHourRequestRepository
  ) {}

  async getRequestCounts() {
    const [leaveRequests, hourRequests] = await Promise.all([
      this.leaveRequestRepository.count(),
      this.hourRequestRepository.count(),
    ])

    return {
      leaveRequests,
      hourRequests,
    }
  }
}
