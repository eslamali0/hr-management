import 'reflect-metadata'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { initializeDatabase } from './config/database'
import { errorHandler } from './utils/errorHandler'
import { createRoutes } from './routes'
import { setupContainer } from './config/container'

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

  return app
}

export default app
