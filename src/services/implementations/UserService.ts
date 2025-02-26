import { IUserService } from '../interfaces/IUserService'
import { IUserRepository } from '../../repositories/interfaces/IUserRepository'
import { IPasswordService } from '../interfaces/IPasswordService'
import { ValidationError, NotFoundError } from '../../utils/errors'
import { inject, injectable } from 'inversify'
import { TYPES } from '../../config/types'
import { Department, User } from '@prisma/client'

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(TYPES.UserRepository)
    private readonly userRepository: IUserRepository,
    @inject(TYPES.PasswordService)
    private readonly passwordService: IPasswordService
  ) {}

  async createUser(userData: Partial<User>): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(userData.email!)
    if (existingUser) {
      throw new ValidationError('Email already exists')
    }

    const hashedPassword = await this.passwordService.hash(userData.password!)

    const user = {
      ...userData,
      password: hashedPassword,
      role: userData.role || 'user',
      annualLeaveBalance: userData.annualLeaveBalance || 21,
      monthlyHourBalance: userData.monthlyHourBalance || 3.0,
    } as User

    return this.userRepository.create(user)
  }

  async register(userData: Partial<User>): Promise<Omit<User, 'password'>> {
    const hashedPassword = await this.passwordService.hash(userData.password!)

    const user = {
      ...userData,
      password: hashedPassword,
      role: 'admin',
    } as User

    return this.userRepository.create(user)
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email)
  }

  async updateLeaveBalance(userId: number, amount: number): Promise<void> {
    await this.userRepository.updateAnnualLeaveBalance(userId, amount)
  }

  async updateHourBalance(userId: number, hours: number): Promise<void> {
    await this.userRepository.updateMonthlyHourBalance(userId, hours)
  }

  async updatePassword(userId: number, newPassword: string): Promise<void> {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new NotFoundError('User not found')
    }

    user.password = newPassword
    await this.userRepository.update(user)
  }

  async findById(userId: number): Promise<User | null> {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new NotFoundError('User not found')
    }
    return user
  }

  async updateProfile(
    userId: number,
    profileData: Partial<User>
  ): Promise<User> {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new NotFoundError('User not found')
    }

    if (profileData.departmentId !== undefined) {
      const departmentExists = await this.userRepository.departmentExists(
        profileData.departmentId!
      )
      if (!departmentExists) {
        throw new ValidationError('Invalid department ID')
      }
      user.departmentId = profileData.departmentId
    }

    return this.userRepository.update(user)
  }

  async getAllUsers(
    page: number,
    limit: number,
    filters?: Record<string, any>,
    sort?: Record<string, 'asc' | 'desc'>
  ): Promise<{
    data: User[]
    total: number
    page: number
    totalPages: number
  }> {
    return this.userRepository.findAll(page, limit, filters, sort)
  }

  async getUserById(userId: number): Promise<User | null> {
    return await this.userRepository.findById(userId)
  }

  async getDepartments(): Promise<Department[]> {
    return this.userRepository.getDepartments()
  }
}
