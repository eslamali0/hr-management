import { Router } from 'express'
import { Container } from 'inversify'
import { TYPES } from '../config/types'
import { StatsController } from '../controllers/StatsController'
import { isAuthenticated, isAdmin } from '../middleware/auth'

export const statsRouter = (container: Container) => {
  const router = Router()
  const statsController = container.get<StatsController>(TYPES.StatsController)

  router.get(
    '/requests',
    isAuthenticated,
    isAdmin,
    statsController.getRequestCounts
  )

  return router
}
