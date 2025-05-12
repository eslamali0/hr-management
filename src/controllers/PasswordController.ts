import { TYPES } from '../config/types'
import { IPasswordService } from '../services/interfaces/IPasswordService'
import { ITokenService } from '../services/interfaces/ITokenService'
import { IUserService } from '../services/interfaces/IUserService'
import { inject, injectable } from 'inversify'
import { Request, Response } from 'express'
import { ApiResponseHandler } from '../utils/apiResponse'
import { asyncHandler } from '../utils/errorHandler'
import { IEmailService } from '../services/interfaces/IEmail.Service'

@injectable()
export class PasswordController {
  constructor(
    @inject(TYPES.TokenService)
    private readonly tokenService: ITokenService,
    @inject(TYPES.UserService)
    private readonly userService: IUserService,
    @inject(TYPES.PasswordService)
    private readonly passwordService: IPasswordService,
    @inject(TYPES.EmailService)
    private readonly emailService: IEmailService
  ) {}

  setupPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = res.locals.validatedData

    const userId = await this.tokenService.verifyPasswordSetupToken(token)

    if (!userId) {
      return res.status(400).json({ message: 'Invalid token' })
    }

    const hashedPassword = await this.passwordService.hash(password)

    await this.userService.updatePassword(userId, hashedPassword)

    ApiResponseHandler.success(res, null, 'Password setup successful')
  })

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = res.locals.validatedData

    const user = await this.userService.findUserByEmail(email)

    if (!user) {
      return ApiResponseHandler.success(
        res,
        null,
        'If your email is registered, you will receive a password reset link'
      )
    }

    const token = await this.tokenService.generatePasswordSetupToken(user.id)

    await this.emailService.sendPasswordSetupEmail(user, token)

    ApiResponseHandler.success(
      res,
      null,
      'If your email is registered, you will receive a password reset link'
    )
  })
}
