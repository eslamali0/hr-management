import { IAuthService } from '../interfaces/IAuthService'
import { IUserService } from '../interfaces/IUserService'
import { IPasswordService } from '../interfaces/IPasswordService'
import jwt from 'jsonwebtoken'
import { AuthenticationError, NotFoundError } from '../../utils/errors'
import { TYPES } from '../../config/types'
import { inject, injectable } from 'inversify'
import { User } from '@prisma/client'

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject(TYPES.UserService)
    private readonly userService: IUserService,
    @inject(TYPES.PasswordService)
    private readonly passwordService: IPasswordService
  ) {}

  async register(
    userData: Partial<User> & { password: string }
  ): Promise<Omit<User, 'password'>> {
    const user = await this.userService.register(userData)

    return user
  }

  async login(
    email: string,
    password: string
  ): Promise<{
    token: string
    user: Pick<User, 'id' | 'name' | 'email' | 'role' | 'departmentId'>
  }> {
    const user = await this.userService.findUserByEmail(email)
    if (!user) {
      throw new AuthenticationError('Invalid credentials')
    }

    const isValidPassword = await this.passwordService.compare(
      password,
      user.password
    )
    if (!isValidPassword) {
      throw new AuthenticationError('Invalid credentials')
    }

    const token = this.generateToken(user)

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        departmentId: user.departmentId,
      },
    }
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.userService.findById(userId)
    if (!user) {
      throw new NotFoundError('User not found')
    }

    const isValidPassword = await this.passwordService.compare(
      currentPassword,
      user.password
    )
    if (!isValidPassword) {
      throw new AuthenticationError('Current password is incorrect')
    }

    const hashedPassword = await this.passwordService.hash(newPassword)
    await this.userService.updatePassword(userId, hashedPassword)
  }

  async updateProfile(
    userId: number,
    profileData: Pick<User, 'name' | 'departmentId'>
  ): Promise<void> {
    await this.userService.updateProfile(userId, profileData)
  }

  private generateToken(user: User): string {
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set')
    }

    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: '24h' }
    )
  }
}
