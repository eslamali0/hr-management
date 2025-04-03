import { Request, Response } from 'express'
import { injectable, inject } from 'inversify'
import { TYPES } from '../config/types'
import { IAuthService } from '../services/interfaces/IAuthService'
import { asyncHandler } from '../utils/errorHandler'
import { ApiResponseHandler } from '../utils/apiResponse'
import { AuthenticationError } from '../utils/errors'

@injectable()
export class AuthController {
  constructor(
    @inject(TYPES.AuthService)
    private readonly authService: IAuthService
  ) {}

  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = res.locals.validatedData
    const result = await this.authService.login(email, password)
    ApiResponseHandler.success(res, result, 'Login successful')
  })

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = res.locals.validatedData
    if (!req.user) {
      throw new AuthenticationError('User not authenticated')
    }
    await this.authService.changePassword(
      req.user.userId,
      currentPassword,
      newPassword
    )
    ApiResponseHandler.success(res, null, 'Password changed successfully')
  })

  register = asyncHandler(async (req: Request, res: Response) => {
    await this.authService.register(res.locals.validatedData)
    ApiResponseHandler.success(res, null, 'Registration successful', 201)
  })

  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = res.locals.validatedData.params
    const { name, departmentId } = res.locals.validatedData.body
    const profileImage = req.file as Express.Multer.File

    await this.authService.updateProfile(userId, {
      name,
      departmentId,
      profileImage,
    })

    ApiResponseHandler.success(res, null, 'Profile updated successfully')
  })
}
