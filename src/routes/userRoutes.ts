import { Router } from 'express'
import { Container } from 'inversify'
import { TYPES } from '../config/types'
import { UserController } from '../controllers/UserController'
import { validateCreateUser } from '../middleware/validation/userValidation'
import { isAuthenticated, isAdmin } from '../middleware/auth'

export const createUserRoutes = (container: Container) => {
  const router = Router()
  const userController = container.get<UserController>(TYPES.UserController)

  router.get('/departments', isAuthenticated, userController.getDepartments)

  router.post(
    '/',
    isAuthenticated,
    isAdmin,
    validateCreateUser,
    userController.createUser
  )
  router.get('/', isAuthenticated, isAdmin, userController.getAllUsers)
  router.get('/:id', isAuthenticated, isAdmin, userController.findById)
  router.get(
    '/email/:email',
    isAuthenticated,
    isAdmin,
    userController.findByEmail
  )
  router.put('/:id', isAuthenticated, isAdmin, userController.updateUser)

  router.delete('/:id', isAuthenticated, isAdmin, userController.deleteUser)

  // User's own leave request management
  router.put(
    '/leave-requests/:requestId',
    isAuthenticated,
    userController.updateOwnLeaveRequest
  )

  router.delete(
    '/leave-requests/:requestId',
    isAuthenticated,
    userController.deleteOwnLeaveRequest
  )

  // User's own hour request management
  router.put(
    '/hour-requests/:requestId',
    isAuthenticated,
    userController.updateOwnHourRequest
  )

  router.delete(
    '/hour-requests/:requestId',
    isAuthenticated,
    userController.deleteOwnHourRequest
  )

  return router
}
