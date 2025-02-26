import { injectable } from 'inversify'
import prisma from '../../lib/prisma'
import { ILeaveRequestRepository } from '../interfaces/ILeaveRequestRepository'
import { LeaveRequest, User } from '@prisma/client'

@injectable()
export class LeaveRequestRepository implements ILeaveRequestRepository {
  async create(
    request: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<LeaveRequest & { user: User }> {
    return prisma.leaveRequest.create({
      data: request,
      include: {
        user: true,
      },
    })
  }

  async update(request: LeaveRequest): Promise<LeaveRequest & { user: User }> {
    return prisma.leaveRequest.update({
      where: { id: request.id },
      data: request,
      include: {
        user: true,
      },
    })
  }

  async delete(id: number): Promise<void> {
    await prisma.leaveRequest.delete({ where: { id } })
  }

  async findById(id: number): Promise<(LeaveRequest & { user: User }) | null> {
    return prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        user: true,
      },
    })
  }

  async findAll(): Promise<LeaveRequest[]> {
    return prisma.leaveRequest.findMany({
      include: { user: true },
    })
  }

  async findByUserId(
    userId: number
  ): Promise<(LeaveRequest & { user: User })[]> {
    return prisma.leaveRequest.findMany({
      where: { userId },
      include: {
        user: true,
      },
    })
  }

  async findByStatus(
    status: 'pending' | 'approved' | 'rejected'
  ): Promise<LeaveRequest[]> {
    return prisma.leaveRequest.findMany({
      where: { status },
      include: { user: true },
    })
  }

  async findPendingRequests(): Promise<(LeaveRequest & { user: User })[]> {
    return prisma.leaveRequest.findMany({
      where: { status: 'pending' },
      include: {
        user: true,
      },
    })
  }
}
