import { initializeApp } from './app'
import logger from './config/logger'
import prisma from './lib/prisma'
import http from 'http'

const PORT = process.env.PORT || 3001

let server: http.Server
const startServer = async () => {
  try {
    const app = await initializeApp()

    server = app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received. Shutting down gracefully...`)
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.')
      try {
        await prisma.$disconnect()
        logger.info('Prisma client disconnected.')
        process.exit(0)
      } catch (e) {
        logger.error('Error disconnecting Prisma client:', e)
        process.exit(1)
      }
    })
  } else {
    logger.info('No active server to close.')
    try {
      await prisma.$disconnect()
      logger.info('Prisma client disconnected.')
      process.exit(0)
    } catch (e) {
      logger.error('Error disconnecting Prisma client:', e)
      process.exit(1)
    }
  }

  // Force shutdown if graceful shutdown fails after a timeout
  setTimeout(() => {
    logger.error(
      'Could not close connections in time, forcefully shutting down'
    )
    process.exit(1)
  }, 10000)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
