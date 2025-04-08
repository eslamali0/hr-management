import { IUserService } from '../interfaces/IUserService'
import { IUserRepository } from '../../repositories/interfaces/IUserRepository'
import { IPasswordService } from '../interfaces/IPasswordService'
import { ValidationError, NotFoundError } from '../../utils/errors'
import { inject, injectable } from 'inversify'
import { TYPES } from '../../config/types'
import { Department, User } from '@prisma/client'
import { IImageService } from '../interfaces/IImageService'
import { UserRole } from '../../constants/userRoles'

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(TYPES.UserRepository)
    private readonly userRepository: IUserRepository,
    @inject(TYPES.ImageService)
    private readonly imagesService: IImageService,
    @inject(TYPES.PasswordService)
    private readonly passwordService: IPasswordService
  ) {}

  async createUser(userData: Partial<User>): Promise<void> {
    const existingUser = await this.userRepository.findByEmail(userData.email!)
    if (existingUser) {
      throw new ValidationError('Email already exists')
    }

    const hashedPassword = await this.passwordService.hash(userData.password!)

    // Ensure hiringDate is properly parsed
    const hiringDate = userData.hiringDate
      ? new Date(userData.hiringDate)
      : new Date()
    const currentYear = new Date().getFullYear()
    const hireYear = hiringDate.getFullYear()
    const initialLeaveBalance = currentYear === hireYear ? 14 : 21

    const user = {
      ...userData,
      password: hashedPassword,
      role: userData.role || UserRole.USER,
      annualLeaveBalance: initialLeaveBalance,
      monthlyHourBalance: userData.monthlyHourBalance || 3,
      hiringDate,
    } as User

    await this.userRepository.create(user)
  }

  async register(userData: Partial<User>): Promise<void> {
    const existingUser = await this.userRepository.findByEmail(userData.email!)
    if (existingUser) {
      throw new ValidationError('Email already exists')
    }

    const hashedPassword = await this.passwordService.hash(userData.password!)

    const user = {
      ...userData,
      password: hashedPassword,
      role: userData.role || UserRole.USER,
    } as User

    this.userRepository.create(user)
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

  async userRequests(
    userId: number,
    page: number,
    limit: number
  ): Promise<{
    user: Pick<User, 'id' | 'name'> | null
    requests: {
      requestDate: Date
      startDate?: Date
      endDate?: Date
      requestedDays?: number
      date?: Date
      requestedHours?: number
      status: string
    }[]
    page: number
    totalPages: number
  }> {
    const userExists = await this.userRepository.findById(userId)
    if (!userExists) {
      throw new NotFoundError('User not found')
    }

    const userRequestsData = await this.userRepository.findUserRequests(
      userId,
      page,
      limit
    )

    return userRequestsData
  }

  async updateProfile(
    userId: number,
    data: {
      name?: string
      departmentId?: number
      profileImage?: Express.Multer.File
    }
  ): Promise<Partial<User>> {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new NotFoundError('User not found')
    }

    if (data.departmentId !== undefined && data.departmentId !== null) {
      const departmentExists = await this.userRepository.departmentExists(
        data.departmentId
      )
      if (!departmentExists) {
        throw new ValidationError('Invalid department ID')
      }
    }

    let imageUrl: string | undefined

    if (data.profileImage) {
      imageUrl = await this.imagesService.uploadImage(data.profileImage)

      // Delete old image if it exists
      if (user.profileImageUrl) {
        const publicId = this.imagesService.getPublicIdFromUrl(
          user.profileImageUrl
        )
        if (publicId) {
          await this.imagesService.deleteImage(publicId)
        }
      }
    }

    // Only allow updating name and departmentId
    const allowedUpdates = {
      name: data.name,
      departmentId: data.departmentId,
      ...(imageUrl && { profileImageUrl: imageUrl }),
    }

    const userUpdated = await this.userRepository.update(userId, allowedUpdates)

    return userUpdated
  }

  async updateProfileImage(
    userId: number,
    profileImage?: Express.Multer.File
  ): Promise<Pick<User, 'profileImageUrl'>> {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new NotFoundError('User not found')
    }
    try {
      const imageUrl = await this.imagesService.uploadImage(profileImage!)

      // Delete old image if it exists
      if (user.profileImageUrl) {
        const publicId = this.imagesService.getPublicIdFromUrl(
          user.profileImageUrl
        )

        if (publicId) {
          await this.imagesService.deleteImage(publicId)
        }
      }

      const updatedUser = await this.userRepository.update(userId, {
        profileImageUrl: imageUrl,
      })

      return {
        profileImageUrl: updatedUser.profileImageUrl || null,
      }
    } catch (error) {
      throw new Error('Error uploading profile image')
    }
  }

  async getAllUsers(
    page: number,
    limit: number,
    filters?: Record<string, any>,
    sort?: Record<string, 'asc' | 'desc'>
  ): Promise<{
    data: Pick<User, 'id' | 'name' | 'profileImageUrl'>[]
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

  async deleteUser(id: number): Promise<void> {
    await this.userRepository.delete(id)
  }
}
