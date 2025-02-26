import prisma from '../lib/prisma'
import logger from './logger'
import { DatabaseError } from '../utils/errors'

export const initializeDatabase = async () => {
  try {
    await prisma.$connect()
    logger.info('Database connection established successfully')
  } catch (err) {
    logger.error('Database connection failed:', err)
    throw new DatabaseError(
      'Unable to connect to the database. Please check your configuration.'
    )
  }
}

export const closeDatabase = async () => {
  await prisma.$disconnect()
}
