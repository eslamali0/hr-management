import { Request, Response } from 'express'
import { injectable, inject } from 'inversify'
import { TYPES } from '../config/types'
import { IUserService } from '../services/interfaces/IUserService'
import { asyncHandler } from '../utils/errorHandler'
import { NotFoundError } from '../utils/errors'
import { ApiResponseHandler } from '../utils/apiResponse'

@injectable()
export class UserController {
  constructor(
    @inject(TYPES.UserService)
    private readonly userService: IUserService
  ) {}

  createUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.userService.createUser({
      ...req.body,
      role: 'user',
    })
    ApiResponseHandler.success(res, user, 'User created successfully', 201)
  })

  findByEmail = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.userService.findUserByEmail(req.params.email)
    if (!user) {
      throw new NotFoundError('User not found')
    }
    ApiResponseHandler.success(res, user, 'User found successfully')
  })

  findById = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.userService.findById(parseInt(req.params.id))
    ApiResponseHandler.success(res, user, 'User found successfully')
  })

  updateLeaveBalance = asyncHandler(async (req: Request, res: Response) => {
    await this.userService.updateLeaveBalance(
      parseInt(req.params.userId),
      req.body.amount
    )
    ApiResponseHandler.success(
      res,
      null,
      'Leave balance updated successfully',
      204
    )
  })

  updateHourBalance = asyncHandler(async (req: Request, res: Response) => {
    await this.userService.updateHourBalance(
      parseInt(req.params.userId),
      req.body.amount
    )
    ApiResponseHandler.success(
      res,
      null,
      'Hour balance updated successfully',
      204
    )
  })

  getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const filters = req.query.filters
      ? JSON.parse(req.query.filters as string)
      : undefined
    const sort = req.query.sort
      ? JSON.parse(req.query.sort as string)
      : undefined

    const result = await this.userService.getAllUsers(
      page,
      limit,
      filters,
      sort
    )
    ApiResponseHandler.success(
      res,
      {
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
        },
      },
      'Users retrieved successfully'
    )
  })

  getDepartments = asyncHandler(async (req: Request, res: Response) => {
    const departments = await this.userService.getDepartments()
    ApiResponseHandler.success(
      res,
      departments,
      'Departments retrieved successfully'
    )
  })

  updateUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.userService.updateUser(
      parseInt(req.params.id),
      req.body
    )
    ApiResponseHandler.success(res, user, 'User updated successfully')
  })

  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    await this.userService.deleteUser(parseInt(req.params.id))
    ApiResponseHandler.success(res, null, 'User deleted successfully', 204)
  })

  // New methods for user request management
  deleteOwnLeaveRequest = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId
    const requestId = parseInt(req.params.requestId)

    await this.userService.deleteOwnLeaveRequest(userId, requestId)
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

    const updatedRequest = await this.userService.updateOwnLeaveRequest(
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

  deleteOwnHourRequest = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId
    const requestId = parseInt(req.params.requestId)

    await this.userService.deleteOwnHourRequest(userId, requestId)
    ApiResponseHandler.success(
      res,
      null,
      'Hour request deleted successfully',
      204
    )
  })

  updateOwnHourRequest = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId
    const requestId = parseInt(req.params.requestId)

    const updatedRequest = await this.userService.updateOwnHourRequest(
      userId,
      requestId,
      req.body
    )
    ApiResponseHandler.success(
      res,
      updatedRequest,
      'Hour request updated successfully'
    )
  })
}
