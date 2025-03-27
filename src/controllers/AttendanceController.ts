import { IAttendanceService } from '../services/interfaces/IAttendanceService'
import { TYPES } from '../config/types'
import { inject, injectable } from 'inversify'
import { asyncHandler } from '../utils/errorHandler'
import { ApiResponseHandler } from '../utils/apiResponse'
import { Request, Response } from 'express'
import { DailyAttendanceResultDTO } from '../types/attendance'

@injectable()
export class AttendanceController {
  constructor(
    @inject(TYPES.AttendanceService)
    private readonly attendanceService: IAttendanceService
  ) {}

  getDailyAttendance = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = res.locals.validatedData

    const result: DailyAttendanceResultDTO =
      await this.attendanceService.getDailyStatus(page, limit)

    ApiResponseHandler.success(
      res,
      result,
      'Daily attendance fetched successfully'
    )
  })
}
