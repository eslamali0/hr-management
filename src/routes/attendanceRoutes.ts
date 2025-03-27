import { AttendanceController } from '../controllers/AttendanceController'
import { TYPES } from '../config/types'
import { Router } from 'express'
import { Container } from 'inversify'
import { isAdmin, isAuthenticated } from '../middleware/auth'
import { validateDailyStatus } from '../middleware/validation/attendanceValidation'

export const attendanceRouter = (container: Container) => {
  const router = Router()
  const attendanceController = container.get<AttendanceController>(
    TYPES.AttendanceController
  )

  router.get(
    '/daily',
    isAuthenticated,
    isAdmin,
    validateDailyStatus,
    attendanceController.getDailyAttendance
  )

  return router
}
