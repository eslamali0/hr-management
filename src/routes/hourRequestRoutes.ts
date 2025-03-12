import { Router } from 'express'
import { Container } from 'inversify'
import { HourRequestController } from '../controllers/HourRequestController'
import { validateUserId } from '../middleware/validation/userValidation'
import {
  validateSubmitHourRequest,
  validateHourRequestId,
} from '../middleware/validation/hourRequestValidation'
import { isAdmin, isAuthenticated } from '../middleware/auth'
import { validateUserOwnership } from '../middleware/validateUserOwnership'
import { TYPES } from '../config/types'

export const hourRequestRouter = (container: Container) => {
  const router = Router()
  const hourRequestController = container.get<HourRequestController>(
    TYPES.HourRequestController
  )

  // Routes for regular users
  router.post(
    '/users/:userId',
    isAuthenticated,
    validateUserOwnership,
    validateSubmitHourRequest,
    hourRequestController.submitRequest
  )

  router.get(
    '/users/:userId',
    isAuthenticated,
    validateUserOwnership,
    validateUserId,
    hourRequestController.getUserRequests
  )

  // Admin-only routes
  router.get(
    '/pending',
    isAuthenticated,
    isAdmin,
    hourRequestController.getPendingRequests
  )

  router.patch(
    '/:requestId/approve',
    isAuthenticated,
    isAdmin,
    validateHourRequestId,
    hourRequestController.approveRequest
  )

  router.patch(
    '/:requestId/reject',
    isAuthenticated,
    isAdmin,
    validateHourRequestId,
    hourRequestController.rejectRequest
  )

  return router
}
