import { Request, Response } from 'express'
import { injectable, inject } from 'inversify'
import { TYPES } from '../config/types'
import { IAuthService } from '../services/interfaces/IAuthService'
import { asyncHandler } from '../utils/errorHandler'

@injectable()
export class AuthController {
  constructor(
    @inject(TYPES.AuthService)
    private readonly authService: IAuthService
  ) {}

  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body
    const result = await this.authService.login(email, password)
    res.json(result)
  })

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body
    await this.authService.changePassword(
      req.user!.userId,
      currentPassword,
      newPassword
    )
    res.json({ message: 'Password changed successfully' })
  })

  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const updatedUser = await this.authService.updateProfile(
      req.user!.userId,
      req.body
    )
    res.json(updatedUser)
  })

  register = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.authService.register(req.body)
    res.json(user)
  })
}
