import { injectable } from 'inversify'
import prisma from '../../lib/prisma'
import { ILeaveRequestRepository } from '../interfaces/ILeaveRequestRepository'
import { LeaveRequest, User } from '@prisma/client'
import { NotFoundError } from '../../utils/errors'
import { RequestStatus } from '../../constants/requestStatus'

@injectable()
export class LeaveRequestRepository implements ILeaveRequestRepository {
  async create(request: Omit<LeaveRequest, 'id'>): Promise<void> {
    try {
      await prisma.leaveRequest.create({
        data: request,
        include: {
          user: true,
        },
      })
    } catch (error) {
      throw error
    }
  }

  async update(request: LeaveRequest): Promise<void> {
    try {
      const { startDate, endDate, requestedDays, status, reason } = request

      await prisma.leaveRequest.update({
        where: { id: request.id },
        data: {
          startDate,
          endDate,
          requestedDays,
          status,
          reason,
        },
        include: {
          user: true,
        },
      })
    } catch (error) {
      throw error
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await prisma.leaveRequest.delete({ where: { id } })
    } catch (error) {
      throw error
    }
  }

  async findById(id: number): Promise<(LeaveRequest & { user: User }) | null> {
    try {
      const request = await prisma.leaveRequest.findUnique({
        where: { id },
        include: {
          user: true,
        },
      })
      if (!request) {
        throw new NotFoundError('Leave request not found')
      }
      return request
    } catch (error) {
      throw error
    }
  }

  async findAll(): Promise<LeaveRequest[]> {
    try {
      return await prisma.leaveRequest.findMany({
        include: { user: true },
      })
    } catch (error) {
      throw error
    }
  }

  async findByUserId(
    userId: number
  ): Promise<
    Pick<
      LeaveRequest,
      'id' | 'startDate' | 'endDate' | 'status' | 'requestedDays' | 'reason'
    >[]
  > {
    try {
      return await prisma.leaveRequest.findMany({
        where: { userId },
        select: {
          id: true,
          startDate: true,
          endDate: true,
          status: true,
          requestedDays: true,
          reason: true,
        },
      })
    } catch (error) {
      throw error
    }
  }

  async findByStatus(
    status:
      | RequestStatus.APPROVED
      | RequestStatus.PENDING
      | RequestStatus.REJECTED
  ): Promise<
    Pick<
      LeaveRequest,
      'id' | 'startDate' | 'endDate' | 'status' | 'requestedDays'
    >[]
  > {
    try {
      return await prisma.leaveRequest.findMany({
        where: { status },
        select: {
          id: true,
          startDate: true,
          endDate: true,
          status: true,
          requestedDays: true,
          user: {
            select: {
              name: true,
              department: { select: { name: true } },
            },
          },
        },
      })
    } catch (error) {
      throw error
    }
  }

  async findPendingRequests(): Promise<(LeaveRequest & { user: User })[]> {
    try {
      return await prisma.leaveRequest.findMany({
        where: { status: RequestStatus.PENDING },
        include: {
          user: true,
        },
      })
    } catch (error) {
      throw error
    }
  }

  async findOverlappingRequests(
    userId: number,
    startDate: Date,
    endDate: Date
  ): Promise<LeaveRequest[]> {
    try {
      return await prisma.leaveRequest.findMany({
        where: {
          userId,
          AND: [
            {
              OR: [
                // Case 1: New request starts during an existing request
                {
                  startDate: { lte: endDate },
                  endDate: { gte: startDate },
                },
                // Case 2: New request contains an existing request
                {
                  startDate: { gte: startDate },
                  endDate: { lte: endDate },
                },
              ],
            },
            {
              status: {
                in: [RequestStatus.PENDING, RequestStatus.APPROVED],
              },
            },
          ],
        },
      })
    } catch (error) {
      throw error
    }
  }

  async approveLeaveRequestWithTransaction(
    requestId: number,
    userId: number,
    newBalance: number
  ): Promise<void> {
    try {
      await prisma.$transaction(async (prismaClient) => {
        await prismaClient.user.update({
          where: { id: userId },
          data: { annualLeaveBalance: newBalance },
        })

        // Update request status only
        await prismaClient.leaveRequest.update({
          where: { id: requestId },
          data: { status: 'Approved' },
        })
      })
    } catch (error) {
      throw error
    }
  }

  async count(): Promise<number> {
    return prisma.leaveRequest.count({
      where: {
        status: RequestStatus.PENDING,
      },
    })
  }
}
