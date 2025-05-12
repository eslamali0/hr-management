import 'reflect-metadata'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { initializeDatabase } from './config/database'
import { errorHandler } from './utils/errorHandler'
import { createRoutes } from './routes'
import { setupContainer } from './config/container'
import cron from 'node-cron'
import { TYPES } from './config/types'
import { IAttendanceService } from './services/interfaces/IAttendanceService'
import { PendingRequestProcessor } from './services/implementations/processors/PendingRequestProcessor'

dotenv.config()

const app = express()

app.use(express.json())

app.use(cors())

// Initialize database and setup container
export const initializeApp = async () => {
  await initializeDatabase()
  const container = setupContainer()

  // Setup routes with container
  app.use('/api', createRoutes(container))

  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' })
  })
  // Error handling
  app.use(errorHandler)

  // Set up cron job to run daily at 12:01 AM
  cron.schedule('1 0 * * *', async () => {
    try {
      console.log('Running daily attendance processing...')
      const attendanceService = container.get<IAttendanceService>(
        TYPES.AttendanceService
      )
      console.log('Successfully retrieved attendance service')
      await attendanceService.processDailyAttendance()
      console.log('Daily attendance processing completed')
    } catch (error) {
      console.error('Error in attendance processing:', error)
    }
  })

  // Add this to your existing cron jobs in app.ts
  // Set up cron job to auto-reject old pending requests every 12 hours
  cron.schedule('0 */12 * * *', async () => {
    try {
      console.log('Running auto-rejection of old pending requests...')
      const pendingRequestProcessor = container.get<PendingRequestProcessor>(
        TYPES.PendingRequestProcessor
      )
      await pendingRequestProcessor.processPendingRequests()
      console.log('Auto-rejection process completed')
    } catch (error) {
      console.error('Error in auto-rejection process:', error)
    }
  })

  return app
}

export default app
