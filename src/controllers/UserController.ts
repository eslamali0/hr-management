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
    const userId = parseInt(req.params.id)
    const profileImage = req.file as Express.Multer.File

    const user = await this.userService.updateProfileImage(userId, profileImage)

    ApiResponseHandler.success(res, user, 'User updated successfully')
  })

  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    await this.userService.deleteUser(parseInt(req.params.id))
    ApiResponseHandler.success(res, null, 'User deleted successfully', 204)
  })
}
