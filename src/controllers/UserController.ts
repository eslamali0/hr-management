import { Request, Response } from 'express'
import { injectable, inject } from 'inversify'
import { TYPES } from '../config/types'
import { IUserService } from '../services/interfaces/IUserService'
import { asyncHandler } from '../utils/errorHandler'
import { NotFoundError } from '../utils/errors'

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
    res.status(201).json(user)
  })

  findByEmail = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.userService.findUserByEmail(req.params.email)
    if (!user) {
      throw new NotFoundError('User not found')
    }
    res.json(user)
  })

  findById = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.userService.findById(parseInt(req.params.userId))
    res.json(user)
  })

  updateLeaveBalance = asyncHandler(async (req: Request, res: Response) => {
    await this.userService.updateLeaveBalance(
      parseInt(req.params.userId),
      req.body.amount
    )
    res.status(204).send()
  })

  updateHourBalance = asyncHandler(async (req: Request, res: Response) => {
    await this.userService.updateHourBalance(
      parseInt(req.params.userId),
      req.body.amount
    )
    res.status(204).send()
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
    res.json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      },
    })
  })

  getDepartments = asyncHandler(async (req: Request, res: Response) => {
    const departments = await this.userService.getDepartments()
    res.json({
      success: true,
      data: departments,
    })
  })
}
