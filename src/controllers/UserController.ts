import { Request, Response } from 'express'
import { injectable, inject } from 'inversify'
import { TYPES } from '../config/types'
import { IUserService } from '../services/interfaces/IUserService'
import { asyncHandler } from '../utils/errorHandler'
import { NotFoundError } from '../utils/errors'
import { ApiResponseHandler } from '../utils/apiResponse'
import { UserRole } from '../constants/userRoles'

@injectable()
export class UserController {
  constructor(
    @inject(TYPES.UserService)
    private readonly userService: IUserService
  ) {}

  createUser = asyncHandler(async (req: Request, res: Response) => {
    const userData = res.locals.validatedData

    const user = await this.userService.createUser({
      ...userData,
      role: UserRole.USER,
      hiringDate: userData.hiringDate
        ? new Date(userData.hiringDate)
        : new Date(),
    })
    ApiResponseHandler.success(res, user, 'User created successfully', 201)
  })

  findByEmail = asyncHandler(async (req: Request, res: Response) => {
    const { email } = res.locals.validatedData
    const user = await this.userService.findUserByEmail(email)
    if (!user) {
      throw new NotFoundError('User not found')
    }
    ApiResponseHandler.success(res, user, 'User found successfully')
  })

  findById = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = res.locals.validatedData

    const user = await this.userService.findById(userId)
    ApiResponseHandler.success(res, user, 'User found successfully')
  })

  updateLeaveBalance = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = res.locals.validatedData.params
    const { amount } = res.locals.validatedData.body

    await this.userService.updateLeaveBalance(userId, amount)
    ApiResponseHandler.success(
      res,
      null,
      'Leave balance updated successfully',
      204
    )
  })

  updateHourBalance = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = res.locals.validatedData.params
    const { amount } = res.locals.validatedData.body

    await this.userService.updateHourBalance(userId, amount)
    ApiResponseHandler.success(
      res,
      null,
      'Hour balance updated successfully',
      204
    )
  })

  getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, filters, sort } = res.locals.validatedData

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
