import { inject, injectable } from 'inversify'
import { ITokenService } from '../interfaces/ITokenService'
import { IUserRepository } from '../../repositories/interfaces/IUserRepository'
import { TYPES } from '../../config/types'
import jwt from 'jsonwebtoken'

@injectable()
export class TokenService implements ITokenService {
  constructor(
    @inject(TYPES.UserRepository)
    private readonly userRepository: IUserRepository
  ) {}

  async generatePasswordSetupToken(userId: number): Promise<string> {
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      throw new Error('JWT secret is not defined')
    }

    return jwt.sign({ userId, purpose: 'password-setup' }, jwtSecret, {
      expiresIn: '15m',
    })
  }

  async verifyPasswordSetupToken(token: string): Promise<number | null> {
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      throw new Error('JWT secret is not defined')
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as {
        userId: number
        purpose: string
      }

      if (decoded.purpose !== 'password-setup') return null

      const user = await this.userRepository.findById(decoded.userId)

      if (!user) return null

      return decoded.userId
    } catch (error) {
      return null
    }
  }
}
