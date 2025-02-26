import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AuthenticationError, AuthorizationError } from '../utils/errors'

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

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as JwtPayload

    req.user = decoded
    next()
  } catch (error) {
    next(new AuthenticationError('Invalid token'))
  }
}

export const isAdmin = (req: Request, _res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return next(new AuthorizationError('Admin access required'))
  }
  next()
}
