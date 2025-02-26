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
  ): Promise<{ token: string; user: Omit<User, 'password'> }> {
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
    const { password: _password, ...userWithoutPassword } = user
    return { token, user: userWithoutPassword }
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
    profileData: Partial<User>
  ): Promise<User> {
    const user = await this.userService.findById(userId)
    if (!user) {
      throw new NotFoundError('User not found')
    }

    // Only allow updating specific fields
    const allowedUpdates = {
      name: profileData.name,
      departmentId: profileData.departmentId,
    }

    return this.userService.updateProfile(userId, allowedUpdates)
  }

  private generateToken(user: User): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    )
  }
}
