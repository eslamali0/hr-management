import { injectable } from 'inversify'
import prisma from '../../lib/prisma'
import { Attendance } from '@prisma/client'
import { IAttendanceRepository } from '../interfaces/IAttendanceRepository'
import { AttendanceStatus } from '../../constants/attendanceStatus'
import { RequestStatus } from '../../constants/requestStatus'
import { UserRole } from '../../constants/userRoles'

@injectable()
export class AttendanceRepository implements IAttendanceRepository {
  async upsertAttendance(
    userId: number,
    date: Date,
    status: AttendanceStatus
  ): Promise<Attendance> {
    try {
      return await prisma.attendance.upsert({
        where: {
          Attendance_userId_date_key: {
            userId,
            date,
          },
        },
        update: {
          status,
        },
        create: {
          userId,
          date,
          status,
        },
      })
    } catch (error) {
      console.error('Error in upsertAttendance:', error)
      throw error
    }
  }

  async findAttendance(userId: number, date: Date): Promise<Attendance | null> {
    return await prisma.attendance.findUnique({
      where: {
        Attendance_userId_date_key: {
          userId,
          date,
        },
      },
    })
  }

  async createAttendance(
    userId: number,
    date: Date,
    status: AttendanceStatus
  ): Promise<Attendance> {
    return await prisma.attendance.create({
      data: {
        userId,
        date,
        status,
      },
    })
  }

  async getDailyStatus(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    data: Array<{
      id: number
      name: string | null
      profileImageUrl: string | null
      department: { name: string } | null
      status: string
      hourRequested: number | null
      leaveFrom: Date | null
      leaveTo: Date | null
    }>
    total: number
    page: number
    totalPages: number
  }> {
    const now = new Date()
    const formattedDate = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    )

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { role: UserRole.USER },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          profileImageUrl: true,
          department: { select: { name: true } },
          attendance: {
            where: {
              date: formattedDate,
            },
            select: { status: true },
          },
          hourRequests: {
            where: { date: formattedDate, status: RequestStatus.APPROVED },
            select: { requestedHours: true },
          },
          leaveRequests: {
            where: {
              startDate: { lte: formattedDate },
              endDate: { gte: formattedDate },
              status: RequestStatus.APPROVED,
            },
            select: { startDate: true, endDate: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.user.count({ where: { role: UserRole.USER } }),
    ])

    const data = users.map((user) => {
      const attendance = user.attendance[0]
      const hourRequest = user.hourRequests[0]
      const leaveRequest = user.leaveRequests[0]

      return {
        id: user.id,
        name: user.name,
        profileImageUrl: user.profileImageUrl,
        department: user.department,
        status: attendance ? attendance.status : AttendanceStatus.PRESENT,
        hourRequested: hourRequest ? hourRequest.requestedHours : null,
        leaveFrom: leaveRequest ? leaveRequest.startDate : null,
        leaveTo: leaveRequest ? leaveRequest.endDate : null,
      }
    })
    return { data, total, page, totalPages: Math.ceil(total / limit) }
  }
}
