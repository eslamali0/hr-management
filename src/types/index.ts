import {
  User as PrismaUser,
  Attendance as PrismaAttendance,
  LeaveRequest as PrismaLeaveRequest,
  Department,
} from '@prisma/client'

export type UserWithRelations = PrismaUser & {
  attendance: PrismaAttendance[]
  leaveRequests: PrismaLeaveRequest[]
  department?: Department
}

export type LeaveRequestWithUser = PrismaLeaveRequest & {
  user: PrismaUser
}

// Re-export Prisma types for convenience
export type User = PrismaUser
export type LeaveRequest = PrismaLeaveRequest
export type Attendance = PrismaAttendance

export type ApiResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: string
  message?: string
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}
