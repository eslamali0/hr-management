import { Request, Response } from 'express'
import { injectable, inject } from 'inversify'
import { TYPES } from '../config/types'
import { ILeaveRequestService } from '../services/interfaces/ILeaveRequestService'
import { asyncHandler } from '../utils/errorHandler'
import { ApiResponseHandler } from '../utils/apiResponse'

@injectable()
export class LeaveRequestController {
  constructor(
    @inject(TYPES.LeaveRequestService)
    private readonly leaveRequestService: ILeaveRequestService
  ) {}

  submitRequest = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = res.locals.validatedData.params
    const requestData = res.locals.validatedData.body

    await this.leaveRequestService.submitLeaveRequest(userId, requestData)
    ApiResponseHandler.success(
      res,
      null,
      'Leave request submitted successfully'
    )
  })

  approveRequest = asyncHandler(async (req: Request, res: Response) => {
    const { requestId } = res.locals.validatedData
    await this.leaveRequestService.approveLeaveRequest(requestId)
    ApiResponseHandler.success(res, null, 'Leave request approved successfully')
  })

  rejectRequest = asyncHandler(async (req: Request, res: Response) => {
    const { requestId } = res.locals.validatedData
    const request = await this.leaveRequestService.rejectLeaveRequest(requestId)
    ApiResponseHandler.success(
      res,
      request,
      'Leave request rejected successfully'
    )
  })

  getUserRequests = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = res.locals.validatedData
    const requests = await this.leaveRequestService.getUserRequests(userId)
    ApiResponseHandler.success(
      res,
      requests,
      'User leave requests retrieved successfully'
    )
  })

  getPendingRequests = asyncHandler(async (req: Request, res: Response) => {
    const pendingRequests = await this.leaveRequestService.getPendingRequests()

    ApiResponseHandler.success(
      res,
      pendingRequests,
      'Pending leave requests retrieved successfully'
    )
  })

  deleteOwnLeaveRequest = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId
    const { requestId } = res.locals.validatedData
    await this.leaveRequestService.deleteOwnLeaveRequest(userId, requestId)
    ApiResponseHandler.success(
      res,
      null,
      'Leave request deleted successfully',
      204
    )
  })

  updateOwnLeaveRequest = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId
    const { requestId } = res.locals.validatedData.params
    const updateData = res.locals.validatedData.body

    const updatedRequest = await this.leaveRequestService.updateOwnLeaveRequest(
      userId,
      requestId,
      updateData
    )
    ApiResponseHandler.success(
      res,
      updatedRequest,
      'Leave request updated successfully'
    )
  })
}
