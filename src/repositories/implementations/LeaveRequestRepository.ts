import { injectable } from 'inversify'
import prisma from '../../lib/prisma'
import { ILeaveRequestRepository } from '../interfaces/ILeaveRequestRepository'
import { LeaveRequest, User } from '@prisma/client'
import { NotFoundError } from '../../utils/errors'
import { RequestStatus } from '../../constants/requestStatus'
import { LeaveDayType } from '../../constants/leaveDayType'

@injectable()
export class LeaveRequestRepository implements ILeaveRequestRepository {
  async create(
    data: Omit<
      LeaveRequest,
      'id' | 'status' | 'createdAt' | 'updatedAt' | 'userId'
    > & { userId: number; status: RequestStatus }
  ): Promise<void> {
    await prisma.leaveRequest.create({
      data,
    })
  }

  async update(
    id: number,
    data: Partial<
      Omit<LeaveRequest, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
    >
  ): Promise<void> {
    await prisma.leaveRequest.update({
      where: { id },
      data,
      include: {
        user: true,
      },
    })
  }

  async delete(id: number): Promise<void> {
    await prisma.leaveRequest.delete({ where: { id } })
  }

  async findById(id: number): Promise<(LeaveRequest & { user: User }) | null> {
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
  }

  async findAll(): Promise<LeaveRequest[]> {
    return await prisma.leaveRequest.findMany({
      include: { user: true },
    })
  }

  async findByUserId(
    userId: number
  ): Promise<
    Pick<
      LeaveRequest,
      'id' | 'startDate' | 'endDate' | 'status' | 'requestedDays' | 'reason'
    >[]
  > {
    return await prisma.leaveRequest.findMany({
      where: { userId },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        status: true,
        requestedDays: true,
        reason: true,
        dayType: true,
      },
      orderBy: { createdAt: 'desc' },
    })
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
          reason: true,
          user: {
            select: {
              name: true,
              profileImageUrl: true,
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
    return await prisma.leaveRequest.findMany({
      where: { status: RequestStatus.PENDING },
      include: {
        user: true,
      },
    })
  }

  async findOverlappingRequests(
    userId: number,
    startDate: Date,
    endDate: Date,
    dayType: LeaveDayType
  ): Promise<LeaveRequest[]> {
    const where = {
      userId,
      status: {
        in: [RequestStatus.PENDING, RequestStatus.APPROVED],
      },
    }

    let overlapConditions: any[] = []

    if (dayType === LeaveDayType.FULL_DAY) {
      overlapConditions = [
        {
          dayType: LeaveDayType.FULL_DAY,
          startDate: { lte: endDate },
          endDate: { gte: startDate },
        },
        {
          dayType: LeaveDayType.HALF_DAY,
          startDate: {
            gte: startDate,
            lte: endDate,
          },
        },
      ]
    } else {
      overlapConditions = [
        {
          dayType: LeaveDayType.FULL_DAY,
          startDate: { lte: startDate },
          endDate: { gte: startDate },
        },
        {
          dayType: LeaveDayType.HALF_DAY,
          startDate: startDate,
        },
      ]
    }

    return prisma.leaveRequest.findMany({
      where: {
        ...where,
        OR: overlapConditions,
      },
    })
  }

  async approveLeaveRequest(
    requestId: number,
    userId: number,
    newBalance: number
  ): Promise<void> {
    await prisma.$transaction(async (prismaClient) => {
      await prismaClient.user.update({
        where: { id: userId },
        data: { annualLeaveBalance: newBalance },
      })

      // Update request status only
      await prismaClient.leaveRequest.update({
        where: { id: requestId },
        data: { status: RequestStatus.APPROVED },
      })
    })
  }

  async count(): Promise<number> {
    return prisma.leaveRequest.count({
      where: {
        status: RequestStatus.PENDING,
      },
    })
  }
}
