import { injectable } from 'inversify'
import prisma from '../../lib/prisma'
import { Department, User } from '@prisma/client'
import { IUserRepository } from '../interfaces/IUserRepository'

@injectable()
export class UserRepository implements IUserRepository {
  async create(
    user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<User> {
    return prisma.user.create({
      data: {
        ...user,
      },
      include: {
        attendance: true,
        leaveRequests: true,
      },
    })
  }

  async update(id: number, data: Partial<User>): Promise<void> {
    await prisma.user.update({
      where: { id },
      data,
    })
  }

  async delete(id: number): Promise<void> {
    await prisma.user.delete({ where: { id } })
  }

  async findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({
      where: {
        id: id,
      },
      include: {
        attendance: true,
        leaveRequests: true,
        department: true,
      },
    })
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    filters?: Record<string, any>,
    sort?: Record<string, 'asc' | 'desc'>
  ): Promise<{
    data: Pick<User, 'name' | 'id'>[]
    total: number
    page: number
    totalPages: number
  }> {
    const where = filters || {}
    const orderBy = sort ? [sort] : []

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where,
        orderBy,
        select: {
          id: true,
          name: true,
          department: { select: { name: true } },
        },
      }),
      prisma.user.count({ where }),
    ])

    return {
      data: users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    })
  }

  async updateAnnualLeaveBalance(
    userId: number,
    amount: number
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true },
      })

      if (!user) {
        throw new Error(`User with ID ${userId} not found`)
      }

      await tx.user.update({
        where: { id: userId },
        data: { annualLeaveBalance: amount },
      })
    })
  }

  async updateMonthlyHourBalance(userId: number, hours: number): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Lock the user record by selecting it first with a write lock
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true },
      })

      if (!user) {
        throw new Error(`User with ID ${userId} not found`)
      }

      await tx.user.update({
        where: { id: userId },
        data: { monthlyHourBalance: hours },
      })
    })
  }

  async updatePassword(userId: number, hashedPassword: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true },
      })

      if (!user) {
        throw new Error(`User with ID ${userId} not found`)
      }

      await tx.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      })
    })
  }

  async departmentExists(id: number): Promise<boolean> {
    const department = await prisma.department.findUnique({
      where: { id },
    })
    return !!department
  }

  async getDepartments(): Promise<Department[]> {
    return await prisma.department.findMany({
      orderBy: {
        name: 'asc',
      },
    })
  }
}
