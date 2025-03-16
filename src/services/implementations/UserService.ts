import { IUserService } from '../interfaces/IUserService'
import { IUserRepository } from '../../repositories/interfaces/IUserRepository'
import { IPasswordService } from '../interfaces/IPasswordService'
import {
  ValidationError,
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from '../../utils/errors'
import { inject, injectable } from 'inversify'
import { TYPES } from '../../config/types'
import { Department, User } from '@prisma/client'
import { ILeaveRequestRepository } from '../../repositories/interfaces/ILeaveRequestRepository'
import { IHourRequestRepository } from '../../repositories/interfaces/IHourRequestRepository'
import { DateCalculator } from '../../utils/DateCalculator'
import { ILeaveRequestValidator } from '../interfaces/ILeaveRequestValidator'
import { IHourRequestValidator } from '../interfaces/IHourRequestValidator'

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(TYPES.UserRepository)
    private readonly userRepository: IUserRepository,
    @inject(TYPES.LeaveRequestRepository)
    private readonly leaveRequestRepository: ILeaveRequestRepository,
    @inject(TYPES.HourRequestRepository)
    private readonly hourRequestRepository: IHourRequestRepository,
    @inject(TYPES.LeaveRequestValidator)
    private readonly leaveRequestValidator: ILeaveRequestValidator,
    @inject(TYPES.HourRequestValidator)
    private readonly hourRequestValidator: IHourRequestValidator
  ) {}

  @inject(TYPES.PasswordService)
  private readonly passwordService: IPasswordService

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
      monthlyHourBalance: userData.monthlyHourBalance || 3,
    } as User

    return this.userRepository.create(user)
  }

  async register(userData: Partial<User>): Promise<Omit<User, 'password'>> {
    const existingUser = await this.userRepository.findByEmail(userData.email!)
    if (existingUser) {
      throw new ValidationError('Email already exists')
    }

    const hashedPassword = await this.passwordService.hash(userData.password!)

    const user = {
      ...userData,
      password: hashedPassword,
      role: userData.role || 'user',
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
    await this.userRepository.updatePassword(userId, newPassword)
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
  ): Promise<void> {
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
    }

    return this.userRepository.update(userId, profileData)
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

  async updateUser(id: number, data: Partial<User>): Promise<void> {
    this.userRepository.update(id, data)
  }

  async deleteUser(id: number): Promise<void> {
    await this.userRepository.delete(id)
  }

  async deleteOwnLeaveRequest(
    userId: number,
    requestId: number
  ): Promise<void> {
    // First verify the request belongs to the user
    const request = await this.leaveRequestRepository.findById(requestId)

    if (!request) {
      throw new NotFoundError('Leave request not found')
    }

    if (request.userId !== userId) {
      throw new ForbiddenError('You can only delete your own requests')
    }

    // Only allow deletion of pending requests
    if (request.status !== 'Pending') {
      throw new BadRequestError('Only pending requests can be deleted')
    }

    await this.leaveRequestRepository.delete(requestId)
  }

  async updateOwnLeaveRequest(
    userId: number,
    requestId: number,
    data: any
  ): Promise<any> {
    const request = await this.leaveRequestRepository.findById(requestId)

    if (!request) throw new NotFoundError('Leave request not found')
    if (request.userId !== userId) throw new ForbiddenError('Not your request')
    if (request.status !== 'Pending')
      throw new BadRequestError('Only pending requests can be updated')

    // Get updated dates or use existing ones
    const startDate = data.startDate
      ? new Date(data.startDate)
      : new Date(request.startDate)
    const endDate = data.endDate
      ? new Date(data.endDate)
      : new Date(request.endDate)

    // Validate date logic
    await this.leaveRequestValidator.validateRequestDates(
      userId,
      startDate,
      endDate
    )

    // Calculate business days
    const requestedDays = DateCalculator.calculateBusinessDays(
      startDate,
      endDate
    )

    // Get user balance
    const user = await this.userRepository.findById(userId)
    if (!user) throw new NotFoundError('User not found')

    // Validate balance
    this.leaveRequestValidator.validateLeaveBalance(
      requestedDays,
      user.annualLeaveBalance
    )

    // Prepare updated data
    const updatedRequest = {
      ...request,
      ...data,
      startDate,
      endDate,
      requestedDays,
      id: requestId,
    }

    return this.leaveRequestRepository.update(updatedRequest)
  }

  async deleteOwnHourRequest(userId: number, requestId: number): Promise<void> {
    const request = await this.hourRequestRepository.findById(requestId)

    if (!request) {
      throw new NotFoundError('Hour request not found')
    }

    if (request.userId !== userId) {
      throw new ForbiddenError('You can only delete your own requests')
    }

    if (request.status !== 'Pending') {
      throw new BadRequestError('Only pending requests can be deleted')
    }

    await this.hourRequestRepository.delete(requestId)
  }

  async updateOwnHourRequest(
    userId: number,
    requestId: number,
    data: any
  ): Promise<any> {
    const request = await this.hourRequestRepository.findById(requestId)

    if (!request) throw new NotFoundError('Hour request not found')
    if (request.userId !== userId) throw new ForbiddenError('Not your request')
    if (request.status !== 'Pending')
      throw new BadRequestError('Only pending requests can be updated')

    // Get updated date or use existing
    const date = data.date ? new Date(data.date) : new Date(request.date)
    const requestedHours = data.requestedHours || request.requestedHours

    // Validate date logic
    if (data.date) {
      await this.hourRequestValidator.validateRequestDates(userId, date)
    }

    // Get user balance
    const user = await this.userRepository.findById(userId)
    if (!user) throw new NotFoundError('User not found')

    // Validate balance
    this.hourRequestValidator.validateHourBalance(
      requestedHours,
      user.monthlyHourBalance
    )

    // Prepare updated data
    const updatedRequest = {
      ...request,
      ...data,
      date,
      requestedHours,
      id: requestId,
    }

    return this.hourRequestRepository.update(updatedRequest)
  }
}
