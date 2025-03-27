import { Department } from '@prisma/client'
import { User } from '../../types'

export interface IUserRepository {
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<void>
  update(id: number, data: Partial<User>): Promise<void>
  delete(id: number): Promise<void>
  findById(id: number): Promise<User | null>
  updatePassword(userId: number, hashedPassword: string): Promise<void>
  findByEmail(email: string): Promise<User | null>
  updateAnnualLeaveBalance(userId: number, amount: number): Promise<void>
  updateMonthlyHourBalance(userId: number, hours: number): Promise<void>
  findAll(
    page: number,
    limit: number,
    filters?: Record<string, any>,
    sort?: Record<string, 'asc' | 'desc'>
  ): Promise<{
    data: Pick<User, 'id' | 'name'>[]
    total: number
    page: number
    totalPages: number
  }>
  departmentExists(id: number): Promise<boolean>
  getDepartments(): Promise<Department[]>
}
