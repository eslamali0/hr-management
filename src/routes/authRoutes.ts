import { Router } from 'express'
import { Container } from 'inversify'
import { TYPES } from '../config/types'
import { AuthController } from '../controllers/AuthController'
import {
  validateLogin,
  validateChangePassword,
  validateRegister,
  validateUpdateProfile,
} from '../middleware/validation/authValidation'
import { isAdmin, isAuthenticated } from '../middleware/auth'

export const authRouter = (container: Container) => {
  const router = Router()
  const authController = container.get<AuthController>(TYPES.AuthController)

  router.post('/register', validateRegister, authController.register)
  router.post('/login', validateLogin, authController.login)

  router.patch(
    '/change-password',
    isAuthenticated,
    validateChangePassword,
    authController.changePassword
  )

  router.patch(
    'users/:userId/profile',
    isAuthenticated,
    isAdmin,
    validateUpdateProfile,
    authController.updateProfile
  )

  return router
}
