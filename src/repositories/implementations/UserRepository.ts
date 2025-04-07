import { injectable } from 'inversify'
import prisma from '../../lib/prisma'
import { Department, User } from '@prisma/client'
import { IUserRepository } from '../interfaces/IUserRepository'
import { UserRole } from '../../constants/userRoles'
import { RequestStatus } from '../../constants/requestStatus'

@injectable()
export class UserRepository implements IUserRepository {
  async create(user: User): Promise<void> {
    await prisma.user.create({
      data: {
        ...user,
      },
      include: {
        attendance: true,
        leaveRequests: true,
      },
    })
  }

  async update(id: number, data: Partial<User>): Promise<Partial<User>> {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        name: true,
        profileImageUrl: true,
        department: {
          select: {
            name: true,
          },
        },
      },
    })

    return user
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
    data: (Pick<User, 'name' | 'id' | 'profileImageUrl'> & {
      department?: { id: number; name: string } | null
      leaveTaken?: number
      leaveBalance?: number
      permissionBalance?: number
    })[]
    total: number
    page: number
    totalPages: number
  }> {
    const where = { ...filters, role: UserRole.USER }
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
          profileImageUrl: true,
          annualLeaveBalance: true,
          monthlyHourBalance: true,
          department: { select: { id: true, name: true } },
          leaveRequests: {
            where: {
              status: 'Approved',
            },
            select: {
              requestedDays: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ])

    // Calculate leave taken, leave balance, and permission balance
    const enrichedUsers = users.map((user) => {
      const leaveTaken =
        user.leaveRequests?.reduce(
          (total, request) => total + (request.requestedDays || 0),
          0
        ) || 0

      return {
        id: user.id,
        name: user.name,
        profileImageUrl: user.profileImageUrl,
        department: user.department,
        leaveTaken,
        leaveBalance: user.annualLeaveBalance || 0,
        permissionBalance: user.monthlyHourBalance || 0,
      }
    })

    return {
      data: enrichedUsers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findUserRequests(
    id: number,
    page: number = 1,
    limit: number = 10
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
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
      },
    })

    const [leaveCount, hourCount] = await Promise.all([
      prisma.leaveRequest.count({
        where: { userId: id, status: RequestStatus.APPROVED },
      }),
      prisma.hourRequest.count({
        where: { userId: id, status: RequestStatus.APPROVED },
      }),
    ])

    const totalItems = leaveCount + hourCount
    const totalPages = Math.ceil(totalItems / limit)

    const requests = await prisma.$queryRaw`
      SELECT 
        createdAt as requestDate,
        startDate,
        endDate,
        requestedDays,
        NULL as date,
        NULL as requestedHours
      FROM LeaveRequest
      WHERE status = ${RequestStatus.APPROVED} AND userId = ${id}
      
      UNION ALL
      
      SELECT 
        createdAt as requestDate,
        NULL as startDate,
        NULL as endDate,
        NULL as requestedDays,
        date,
        requestedHours
      FROM HourRequest
      WHERE status = ${RequestStatus.APPROVED} AND userId = ${id}
      
      ORDER BY requestDate DESC
      OFFSET ${(page - 1) * limit} ROWS
      FETCH NEXT ${limit} ROWS ONLY
    `

    return {
      user,
      requests: requests as any[],
      page,
      totalPages,
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
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
