import { Router } from 'express'
import { Container } from 'inversify'
import { TYPES } from '../config/types'
import { LeaveRequestController } from '../controllers/LeaveRequestController'
import { isAuthenticated, isAdmin, isUser } from '../middleware/auth'
import {
  validateLeaveRequest,
  validateLeaveRequestId,
  validateUpdateLeaveRequest,
  validateUserIdParam,
} from '../middleware/validation/leaveRequestValidation'

export const leaveRequestRouter = (container: Container) => {
  const router = Router()
  const leaveRequestController = container.get<LeaveRequestController>(
    TYPES.LeaveRequestController
  )

  router.post(
    '/:userId',
    isAuthenticated,
    isUser,
    validateLeaveRequest,
    leaveRequestController.submitRequest
  )

  router.get(
    '/pending',
    isAuthenticated,
    isAdmin,
    leaveRequestController.getPendingRequests
  )

  router.get(
    '/user/:userId',
    isAuthenticated,
    validateUserIdParam,
    leaveRequestController.getUserRequests
  )

  router.patch(
    '/:requestId/approve',
    isAuthenticated,
    isAdmin,
    validateLeaveRequestId,
    leaveRequestController.approveRequest
  )

  router.patch(
    '/:requestId/reject',
    isAuthenticated,
    isAdmin,
    validateLeaveRequestId,
    leaveRequestController.rejectRequest
  )

  router.put(
    '/leave-requests/:requestId',
    isAuthenticated,
    validateUpdateLeaveRequest,
    leaveRequestController.updateOwnLeaveRequest
  )

  router.delete(
    '/leave-requests/:requestId',
    isAuthenticated,
    validateLeaveRequestId,
    leaveRequestController.deleteOwnLeaveRequest
  )

  return router
}
