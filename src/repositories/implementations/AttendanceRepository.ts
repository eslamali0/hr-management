import { injectable } from 'inversify'
import prisma from '../../lib/prisma'
import { Attendance } from '@prisma/client'
import { IAttendanceRepository } from '../interfaces/IAttendanceRepository'

@injectable()
export class AttendanceRepository implements IAttendanceRepository {
  async create(
    attendance: Omit<Attendance, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Attendance> {
    return prisma.attendance.create({
      data: attendance,
      include: { user: true },
    })
  }

  async update(attendance: Attendance): Promise<Attendance> {
    return prisma.attendance.update({
      where: { id: attendance.id },
      data: attendance,
      include: { user: true },
    })
  }

  async delete(id: number): Promise<void> {
    await prisma.attendance.delete({ where: { id } })
  }

  async findById(id: number): Promise<Attendance | null> {
    return prisma.attendance.findUnique({
      where: { id },
      include: { user: true },
    })
  }

  async findAll(): Promise<Attendance[]> {
    return prisma.attendance.findMany({
      include: { user: true },
    })
  }

  async findByUserId(userId: number): Promise<Attendance | null> {
    return prisma.attendance.findUnique({
      where: { userId },
      include: { user: true },
    })
  }
}
