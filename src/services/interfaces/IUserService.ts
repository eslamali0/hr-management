import { Department, User } from '@prisma/client'

export interface IUserService {
  createUser(userData: Partial<User>): Promise<User>
  register(userData: Partial<User>): Promise<Omit<User, 'password'>>
  findUserByEmail(email: string): Promise<User | null>
  updateLeaveBalance(userId: number, amount: number): Promise<void>
  updateHourBalance(userId: number, hours: number): Promise<void>
  updatePassword(userId: number, newPassword: string): Promise<void>
  findById(userId: number): Promise<User | null>
  updateProfile(
    userId: number,
    data: Pick<User, 'name' | 'departmentId'>
  ): Promise<void>
  updateProfileImage(
    userId: number,
    profileImage: Express.Multer.File
  ): Promise<void>
  getAllUsers(
    page?: number,
    limit?: number,
    filters?: Record<string, any>,
    sort?: Record<string, 'asc' | 'desc'>
  ): Promise<{
    data: Pick<User, 'id' | 'name'>[]
    total: number
    page: number
    totalPages: number
  }>
  getUserById(userId: number): Promise<User | null>
  getDepartments(): Promise<Department[]>
  deleteUser(id: number): Promise<void>
}
