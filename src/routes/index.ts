import { Router } from 'express'
import { Container } from 'inversify'
import { createUserRoutes } from './userRoutes'
import { authRouter } from './authRoutes'
import { leaveRequestRouter } from './leaveRequestRoutes'

export const createRoutes = (container: Container) => {
  const router = Router()

  router.use('/users', createUserRoutes(container))
  router.use('/auth', authRouter(container))
  router.use('/leave-requests', leaveRequestRouter(container))

  return router
}
