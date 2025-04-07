import { Department, User } from '@prisma/client'

export interface IUserService {
  createUser(userData: Partial<User>): Promise<void>
  register(userData: Partial<User>): Promise<void>
  findUserByEmail(email: string): Promise<User | null>
  updateLeaveBalance(userId: number, amount: number): Promise<void>
  updateHourBalance(userId: number, hours: number): Promise<void>
  updatePassword(userId: number, newPassword: string): Promise<void>
  findById(userId: number): Promise<User | null>
  userRequests(
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
  }>
  updateProfile(
    userId: number,
    data: {
      name?: string
      departmentId?: number
      profileImage?: Express.Multer.File
    }
  ): Promise<Partial<User>>
  updateProfileImage(
    userId: number,
    profileImage: Express.Multer.File
  ): Promise<Pick<User, 'profileImageUrl'>>
  getAllUsers(
    page?: number,
    limit?: number,
    filters?: Record<string, any>,
    sort?: Record<string, 'asc' | 'desc'>
  ): Promise<{
    data: Pick<User, 'id' | 'name' | 'profileImageUrl'>[]
    total: number
    page: number
    totalPages: number
  }>
  getUserById(userId: number): Promise<User | null>
  getDepartments(): Promise<Department[]>
  deleteUser(id: number): Promise<void>
}
