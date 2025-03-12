import { Router } from 'express'
import { Container } from 'inversify'
import { createUserRoutes } from './userRoutes'
import { authRouter } from './authRoutes'
import { leaveRequestRouter } from './leaveRequestRoutes'
import { hourRequestRouter } from './hourRequestRoutes'
import { statsRouter } from './statsRoutes'

export const createRoutes = (container: Container) => {
  const router = Router()

  router.use('/users', createUserRoutes(container))
  router.use('/auth', authRouter(container))
  router.use('/leave-requests', leaveRequestRouter(container))
  router.use('/hour-requests', hourRequestRouter(container))
  router.use('/stats', statsRouter(container))

  return router
}
