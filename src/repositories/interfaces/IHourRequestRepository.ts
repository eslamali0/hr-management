import { RequestStatus } from '../../constants/requestStatus'
import { HourRequest, User } from '@prisma/client'

export interface IHourRequestRepository {
  create(request: Omit<HourRequest, 'id'>): Promise<void>
  update(request: HourRequest): Promise<void>
  delete(id: number): Promise<void>
  findById(id: number): Promise<HourRequest | null>
  findAll(): Promise<HourRequest[]>
  findByUserId(userId: number): Promise<Partial<HourRequest>[]>
  findByStatus(
    status:
      | RequestStatus.APPROVED
      | RequestStatus.PENDING
      | RequestStatus.REJECTED
  ): Promise<
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
