import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { TYPES } from '../config/types'
import { IHourRequestService } from '../services/interfaces/IHourRequestService'
import { ApiResponseHandler } from '../utils/apiResponse'
import { asyncHandler } from '../utils/errorHandler'

@injectable()
export class HourRequestController {
  constructor(
    @inject(TYPES.HourRequestService)
    private readonly hourRequestService: IHourRequestService
  ) {}

  submitRequest = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = res.locals.validatedData.params
    const requestData = res.locals.validatedData.body

    await this.hourRequestService.submitHourRequest(userId, requestData)

    ApiResponseHandler.success(res, null, 'Hour request submitted successfully')
  })

  approveRequest = asyncHandler(async (req: Request, res: Response) => {
    const { requestId } = res.locals.validatedData

    const hourRequest = await this.hourRequestService.approveHourRequest(
      requestId
    )

    ApiResponseHandler.success(
      res,
      hourRequest,
      'Hour request approved successfully'
    )
  })

  rejectRequest = asyncHandler(async (req: Request, res: Response) => {
    const { requestId } = res.locals.validatedData

    const hourRequest = await this.hourRequestService.rejectHourRequest(
      requestId
    )

    ApiResponseHandler.success(
      res,
      hourRequest,
      'Hour request rejected successfully'
    )
  })

  getPendingRequests = asyncHandler(async (_req: Request, res: Response) => {
    const pendingRequests = await this.hourRequestService.getPendingRequests()

    ApiResponseHandler.success(
      res,
      pendingRequests,
      'Pending hour requests retrieved successfully'
    )
  })

  getUserRequests = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = res.locals.validatedData

    const userRequests = await this.hourRequestService.getUserRequests(userId)

    ApiResponseHandler.success(
      res,
      userRequests,
      'User hour requests retrieved successfully'
    )
  })

  deleteOwnHourRequest = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId
    const { requestId } = res.locals.validatedData

    await this.hourRequestService.deleteOwnHourRequest(userId, requestId)
    ApiResponseHandler.success(
      res,
      null,
      'Hour request deleted successfully',
      204
    )
  })

  updateOwnHourRequest = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId
    const { requestId } = res.locals.validatedData.params
    const updateData = res.locals.validatedData.body

    const updatedRequest = await this.hourRequestService.updateHourRequest(
      userId,
      requestId,
      updateData
    )
    ApiResponseHandler.success(
      res,
      updatedRequest,
      'Hour request updated successfully'
    )
  })
}
