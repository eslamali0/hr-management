import { inject, injectable } from 'inversify'
import { Request, Response } from 'express'
import { IStatsService } from '../services/interfaces/IStatsService'
import { TYPES } from '../config/types'
import { asyncHandler } from '../utils/errorHandler'
import { ApiResponseHandler } from '../utils/apiResponse'

@injectable()
export class StatsController {
  constructor(
    @inject(TYPES.StatsService)
    private statsService: IStatsService
  ) {}

  getRequestCounts = asyncHandler(async (req: Request, res: Response) => {
    const counts = await this.statsService.getRequestCounts()
    ApiResponseHandler.success(
      res,
      counts,
      'Request counts retrieved successfully'
    )
  })
}
