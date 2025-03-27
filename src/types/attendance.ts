import { AttendanceStatus } from '../constants/attendanceStatus'

export interface DailyAttendanceQueryDTO {
  date: Date
  page: number
  limit: number
}

export interface DailyAttendanceResponseDTO {
  id: number
  name: string | null
  profileImageUrl: string | null
  department: { name: string } | null
  status: string
  hourRequested: number | null
  leaveFrom: Date | null
  leaveTo: Date | null
}

export interface DailyAttendanceResultDTO {
  data: DailyAttendanceResponseDTO[]
  total: number
  page: number
  totalPages: number
}
