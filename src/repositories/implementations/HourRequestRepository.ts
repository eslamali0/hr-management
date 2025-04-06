import { injectable } from 'inversify'
import prisma from '../../lib/prisma'
import { IHourRequestRepository } from '../interfaces/IHourRequestRepository'
import { HourRequest } from '@prisma/client'
import { NotFoundError } from '../../utils/errors'
import { RequestStatus } from '../../constants/requestStatus'

@injectable()
export class HourRequestRepository implements IHourRequestRepository {
  async create(request: Omit<HourRequest, 'id'>): Promise<void> {
    await prisma.hourRequest.create({
      data: request,
    })
  }

  async update(request: HourRequest): Promise<void> {
    const { id, requestedHours } = request
    await prisma.hourRequest.update({
      where: { id },
      data: { requestedHours },
    })
  }

  async approveRequestWithTransaction(
    requestId: number,
    userId: number,
    newBalance: number
  ): Promise<void> {
    try {
      await prisma.$transaction(async (prismaClient) => {
        // Update user's hour balance
        await prismaClient.user.update({
          where: { id: userId },
          data: { monthlyHourBalance: newBalance },
        })

        // Update request status
        await prismaClient.hourRequest.update({
          where: { id: requestId },
          data: { status: RequestStatus.APPROVED },
        })
      })
    } catch (error) {
      throw new Error('Failed to process hour request')
    }
  }

  async rejectRequest(requestId: number): Promise<void> {
    try {
      await prisma.hourRequest.update({
        where: { id: requestId },
        data: { status: RequestStatus.REJECTED },
      })
    } catch (error) {
      throw new Error('Failed to reject hour request')
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await prisma.hourRequest.delete({ where: { id } })
    } catch (error) {
      throw error
    }
  }

  async findById(id: number): Promise<HourRequest | null> {
    try {
      const request = await prisma.hourRequest.findUnique({
        where: { id },
      })
      if (!request) {
        throw new NotFoundError('Hour request not found')
      }
      return request
    } catch (error) {
      throw error
    }
  }

  async findAll(): Promise<HourRequest[]> {
    try {
      return await prisma.hourRequest.findMany({
        include: { user: true },
      })
    } catch (error) {
      throw error
    }
  }

  async findByUserId(userId: number): Promise<Partial<HourRequest>[]> {
    try {
      return await prisma.hourRequest.findMany({
        where: { userId },
        select: { id: true, date: true, requestedHours: true, status: true },
      })
    } catch (error) {
      throw error
    }
  }

  async findByStatus(
    status:
      | RequestStatus.PENDING
      | RequestStatus.APPROVED
      | RequestStatus.REJECTED
  ): Promise<
    (Partial<HourRequest> & {
      user: {
        name: string | null
        profileImageUrl: string | null
        department: { name: string } | null
      }
    })[]
  > {
    try {
      return await prisma.hourRequest.findMany({
        where: { status },
        select: {
          id: true,
          date: true,
          requestedHours: true,
          status: true,
          user: {
            select: {
              name: true,
              profileImageUrl: true,
              department: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          date: 'asc',
        },
      })
    } catch (error) {
      throw error
    }
  }

  async findByUserIdAndDate(
    userId: number,
    date: Date
  ): Promise<HourRequest | null> {
    try {
      return await prisma.hourRequest.findFirst({
        where: {
          userId,
          date: {
            equals: date,
          },
        },
      })
    } catch (error) {
      throw error
    }
  }

  async count(): Promise<number> {
    return prisma.hourRequest.count({
      where: {
        status: RequestStatus.PENDING,
      },
    })
  }
}
