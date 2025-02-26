import { Department, User } from '@prisma/client'
export interface IUserService {
  createUser(userData: Partial<User>): Promise<User>
  register(userData: Partial<User>): Promise<Omit<User, 'password'>>
  findUserByEmail(email: string): Promise<User | null>
  findById(userId: number): Promise<User | null>
  updateLeaveBalance(userId: number, amount: number): Promise<void>
  updateHourBalance(userId: number, hours: number): Promise<void>
  updatePassword(userId: number, newPassword: string): Promise<void>
  updateProfile(userId: number, profileData: Partial<User>): Promise<User>
  getAllUsers(
    page?: number,
    limit?: number,
    filters?: Record<string, any>,
    sort?: Record<string, 'asc' | 'desc'>
  ): Promise<{ data: User[]; total: number; page: number; totalPages: number }>
  getDepartments(): Promise<Department[]>
}
