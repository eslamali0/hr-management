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
    const { email, password } = req.body
    const result = await this.authService.login(email, password)
    ApiResponseHandler.success(res, result, 'Login successful')
  })

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body
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

  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AuthenticationError('User not authenticated')
    }
    const updatedUser = await this.authService.updateProfile(
      req.user.userId,
      req.body
    )
    ApiResponseHandler.success(res, updatedUser, 'Profile updated successfully')
  })

  register = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.authService.register(req.body)
    ApiResponseHandler.success(res, user, 'Registration successful', 201)
  })
}
