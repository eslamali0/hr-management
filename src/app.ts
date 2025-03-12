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

  // Error handling
  app.use(errorHandler)

  // Set up cron job to run daily at 12:01 AM
  cron.schedule('1 0 * * *', async () => {
    console.log('Running daily attendance processing...')
    const attendanceService = container.get<IAttendanceService>(
      TYPES.AttendanceService
    )
    await attendanceService.processDailyAttendance()
    console.log('Daily attendance processing completed')
  })

  return app
}

export default app
