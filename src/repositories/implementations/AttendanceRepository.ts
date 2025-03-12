import { injectable } from 'inversify'
import prisma from '../../lib/prisma'
import { Attendance } from '@prisma/client'
import { IAttendanceRepository } from '../interfaces/IAttendanceRepository'
import { NotFoundError } from '../../utils/errors'

@injectable()
export class AttendanceRepository implements IAttendanceRepository {
  async create(attendance: Omit<Attendance, 'id'>): Promise<Attendance> {
    try {
      return prisma.attendance.create({
        data: attendance,
        include: { user: true },
      })
    } catch (error) {
      throw error
    }
  }

  async update(attendance: Attendance): Promise<Attendance> {
    try {
      return prisma.attendance.update({
        where: { id: attendance.id },
        data: attendance,
        include: { user: true },
      })
    } catch (error) {
      throw error
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await prisma.attendance.delete({ where: { id } })
    } catch (error) {
      throw error
    }
  }

  async findById(id: number): Promise<Attendance | null> {
    try {
      const attendance = await prisma.attendance.findUnique({
        where: { id },
        include: { user: true },
      })
      if (!attendance) {
        throw new NotFoundError('Attendance record not found')
      }
      return attendance
    } catch (error) {
      throw error
    }
  }

  async findAll(): Promise<Attendance[]> {
    try {
      return prisma.attendance.findMany({
        include: { user: true },
      })
    } catch (error) {
      throw error
    }
  }

  // async findByUserId(userId: number): Promise<Attendance | null> {
  //   try {
  //     const attendance = await prisma.attendance.findUnique({
  //       where: { userId },
  //       include: { user: true },
  //     })
  //     if (!attendance) {
  //       throw new NotFoundError('Attendance record not found')
  //     }
  //     return attendance
  //   } catch (error) {
  //     throw error
  //   }
  // }
}
