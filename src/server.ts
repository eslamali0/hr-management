import { initializeApp } from './app'
import logger from './config/logger'

const PORT = process.env.PORT

const startServer = async () => {
  try {
    const app = await initializeApp()

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
