import { Department } from '@prisma/client'
import { User } from '../../types'

export interface IUserRepository {
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>
  update(user: User): Promise<User>
  delete(id: number): Promise<void>
  findById(id: number): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  updateAnnualLeaveBalance(userId: number, amount: number): Promise<void>
  updateMonthlyHourBalance(userId: number, hours: number): Promise<void>
  findAll(
    page: number,
    limit: number,
    filters?: Record<string, any>,
    sort?: Record<string, 'asc' | 'desc'>
  ): Promise<{ data: User[]; total: number; page: number; totalPages: number }>
  departmentExists(id: number): Promise<boolean>
  getDepartments(): Promise<Department[]>
}
