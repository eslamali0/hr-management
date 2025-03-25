import { injectable } from 'inversify'
import prisma from '../../lib/prisma'
import { Attendance } from '@prisma/client'
import { IAttendanceRepository } from '../interfaces/IAttendanceRepository'
import { AttendanceStatus } from '../../constants/attendanceStatus'

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
}
