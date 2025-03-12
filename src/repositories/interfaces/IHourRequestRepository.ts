import { HourRequest, User } from '@prisma/client'

export interface IHourRequestRepository {
  create(
    request: Omit<HourRequest, 'id'>
  ): Promise<HourRequest & { user: User }>
  update(request: HourRequest): Promise<void>
  delete(id: number): Promise<void>
  findById(id: number): Promise<HourRequest | null>
  findAll(): Promise<HourRequest[]>
  findByUserId(userId: number): Promise<Partial<HourRequest>[]>
  findByStatus(status: 'pending' | 'approved' | 'rejected'): Promise<
    (Partial<HourRequest> & {
      user: {
        name: string | null
        department: { name: string } | null
      }
    })[]
  >
  findByUserIdAndDate(userId: number, date: Date): Promise<HourRequest | null>
  approveRequestWithTransaction(
    requestId: number,
    userId: number,
    newBalance: number
  ): Promise<void>

  rejectRequest(requestId: number): Promise<void>
  count(): Promise<number>
}
