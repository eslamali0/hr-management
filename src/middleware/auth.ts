import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AuthenticationError, AuthorizationError } from '../utils/errors'
import { UserRole } from '../constants/userRoles'

interface JwtPayload {
  userId: number
  email: string
  role: string
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export const isAuthenticated = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      throw new AuthenticationError('No token provided')
    }

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set')
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload

    req.user = decoded
    next()
  } catch (error) {
    next(new AuthenticationError('Invalid token'))
  }
}

export const isUser = (req: Request, _res: Response, next: NextFunction) => {
  if (req.user?.role !== UserRole.USER) {
    return next(new AuthenticationError('User access required'))
  }
  next()
}

export const isAdmin = (req: Request, _res: Response, next: NextFunction) => {
  if (req.user?.role !== UserRole.ADMIN) {
    return next(new AuthorizationError('Admin access required'))
  }
  next()
}
