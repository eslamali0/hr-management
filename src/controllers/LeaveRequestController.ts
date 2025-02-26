import { Request, Response } from 'express'
import { injectable, inject } from 'inversify'
import { TYPES } from '../config/types'
import { ILeaveRequestService } from '../services/interfaces/ILeaveRequestService'
import { asyncHandler } from '../utils/errorHandler'

@injectable()
export class LeaveRequestController {
  constructor(
    @inject(TYPES.LeaveRequestService)
    private readonly leaveRequestService: ILeaveRequestService
  ) {}

  submitRequest = async (req: Request, res: Response) => {
    const request = await this.leaveRequestService.submitLeaveRequest(
      parseInt(req.params.userId),
      req.body
    )
    res.status(201).json(request)
  }

  approveRequest = async (req: Request, res: Response) => {
    const request = await this.leaveRequestService.approveLeaveRequest(
      parseInt(req.params.requestId)
    )
    res.json(request)
  }

  rejectRequest = async (req: Request, res: Response) => {
    const request = await this.leaveRequestService.rejectLeaveRequest(
      parseInt(req.params.requestId)
    )
    res.json(request)
  }

  getPendingRequests = async (_req: Request, res: Response) => {
    const requests = await this.leaveRequestService.getPendingRequests()
    res.json(requests)
  }

  getUserRequests = asyncHandler(async (req: Request, res: Response) => {
    const requests = await this.leaveRequestService.getUserRequests(
      parseInt(req.params.userId)
    )
    res.json(requests)
  })
}
