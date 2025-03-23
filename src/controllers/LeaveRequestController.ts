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
    const userId = parseInt(req.params.userId)
    const requestData = req.body

    await this.leaveRequestService.submitLeaveRequest(userId, requestData)

    ApiResponseHandler.success(res, 'Leave request submitted successfully')
  })

  approveRequest = asyncHandler(async (req: Request, res: Response) => {
    await this.leaveRequestService.approveLeaveRequest(
      parseInt(req.params.requestId)
    )
    ApiResponseHandler.success(res, 'Leave request approved successfully')
  })

  rejectRequest = asyncHandler(async (req: Request, res: Response) => {
    const request = await this.leaveRequestService.rejectLeaveRequest(
      parseInt(req.params.requestId)
    )
    ApiResponseHandler.success(
      res,
      request,
      'Leave request rejected successfully'
    )
  })

  getPendingRequests = asyncHandler(async (_req: Request, res: Response) => {
    const requests = await this.leaveRequestService.getPendingRequests()
    ApiResponseHandler.success(
      res,
      requests,
      'Pending leave requests retrieved successfully'
    )
  })

  getUserRequests = asyncHandler(async (req: Request, res: Response) => {
    const requests = await this.leaveRequestService.getUserRequests(
      parseInt(req.params.userId)
    )
    ApiResponseHandler.success(
      res,
      requests,
      'User leave requests retrieved successfully'
    )
  })

  deleteOwnLeaveRequest = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId
    const requestId = parseInt(req.params.requestId)

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
    const requestId = parseInt(req.params.requestId)

    const updatedRequest = await this.leaveRequestService.updateOwnLeaveRequest(
      userId,
      requestId,
      req.body
    )
    ApiResponseHandler.success(
      res,
      updatedRequest,
      'Leave request updated successfully'
    )
  })
}
