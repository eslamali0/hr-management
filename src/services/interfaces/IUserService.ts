import { Department, User } from '@prisma/client'

export interface IUserService {
  createUser(userData: Partial<User>): Promise<User>
  register(userData: Partial<User>): Promise<Omit<User, 'password'>>
  findUserByEmail(email: string): Promise<User | null>
  updateLeaveBalance(userId: number, amount: number): Promise<void>
  updateHourBalance(userId: number, hours: number): Promise<void>
  updatePassword(userId: number, newPassword: string): Promise<void>
  findById(userId: number): Promise<User | null>
  updateProfile(userId: number, profileData: Partial<User>): Promise<void>
  getAllUsers(
    page?: number,
    limit?: number,
    filters?: Record<string, any>,
    sort?: Record<string, 'asc' | 'desc'>
  ): Promise<{ data: User[]; total: number; page: number; totalPages: number }>
  getUserById(userId: number): Promise<User | null>
  getDepartments(): Promise<Department[]>
  updateUser(id: number, data: Partial<User>): Promise<void>
  deleteUser(id: number): Promise<void>

  // New methods for user request management
  deleteOwnLeaveRequest(userId: number, requestId: number): Promise<void>
  updateOwnLeaveRequest(
    userId: number,
    requestId: number,
    data: any
  ): Promise<any>
  deleteOwnHourRequest(userId: number, requestId: number): Promise<void>
  updateOwnHourRequest(
    userId: number,
    requestId: number,
    data: any
  ): Promise<any>
}
