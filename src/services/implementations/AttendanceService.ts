import { injectable } from 'inversify'
import { IAttendanceService } from '../interfaces/IAttendanceService'
import prisma from '../../lib/prisma'
import { Attendance } from '@prisma/client'
import { NotFoundError } from '../../utils/errors'

@injectable()
export class AttendanceService implements IAttendanceService {
  async markAttendance(
    userId: number,
    status: 'Present' | 'On_Leave' | 'Hourly_Leave'
  ): Promise<Attendance> {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      throw new NotFoundError('User not found')
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return await prisma.attendance.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: { status },
      create: {
        userId,
        date: today,
        status,
      },
    })
  }

  async getCurrentAttendance(userId: number): Promise<Attendance | null> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    })
  }

  // New method for daily processing
  async processDailyAttendance(): Promise<void> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Skip weekends (5 = Friday, 6 = Saturday in your system)
    const dayOfWeek = today.getDay()
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      return // No processing needed for weekends
    }

    // Get all active users
    const users = await prisma.user.findMany({
      select: { id: true },
    })

    // Get all approved leave requests that include today
    const leaveRequests = await prisma.leaveRequest.findMany({
      where: {
        status: 'Approved',
        startDate: { lte: today },
        endDate: { gte: today },
      },
    })

    // Create a map for quick lookup
    const onLeaveUserIds = new Set(leaveRequests.map((req) => req.userId))

    // Process each user
    for (const user of users) {
      // Check if user has an approved leave for today
      if (onLeaveUserIds.has(user.id)) {
        // Create/update attendance record with on_leave status
        await prisma.attendance.upsert({
          where: {
            userId_date: {
              userId: user.id,
              date: today,
            },
          },
          update: { status: 'On_Leave' },
          create: {
            userId: user.id,
            date: today,
            status: 'On_Leave',
          },
        })
      } else {
        // Only create default record if no manual entry exists
        const existingRecord = await prisma.attendance.findUnique({
          where: {
            userId_date: {
              userId: user.id,
              date: today,
            },
          },
        })

        if (!existingRecord) {
          // Create default attendance record (present)
          await prisma.attendance.create({
            data: {
              userId: user.id,
              date: today,
              status: 'Present',
            },
          })
        }
      }
    }
  }
}
