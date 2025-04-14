import { Router } from 'express'
import { Container } from '../config/container'
import { PasswordController } from '../controllers/PasswordController'
import { TYPES } from '../config/types'
import {
  validateForgotPassword,
  validateSetupPassword,
} from '../middleware/validation/userValidation'

export const passwordRouter = (container: Container) => {
  const router = Router()
  const passwordController = container.get<PasswordController>(
    TYPES.PasswordController
  )

  router.post('/setup', validateSetupPassword, passwordController.setupPassword)
  router.post(
    '/forgotPassword',
    validateForgotPassword,
    passwordController.forgotPassword
  )

  return router
}
