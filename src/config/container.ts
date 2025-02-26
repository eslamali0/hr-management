import { Container } from 'inversify'
import { TYPES } from './types'
import { AuthService } from '../services/implementations/AuthService'
import { UserService } from '../services/implementations/UserService'
import { LeaveRequestService } from '../services/implementations/LeaveRequestService'
import { UserController } from '../controllers/UserController'
import { AuthController } from '../controllers/AuthController'
import { LeaveRequestController } from '../controllers/LeaveRequestController'
import { UserRepository } from '../repositories/implementations/UserRepository'
import { LeaveRequestRepository } from '../repositories/implementations/LeaveRequestRepository'
import { IAuthService } from '../services/interfaces/IAuthService'
import { IUserService } from '../services/interfaces/IUserService'
import { ILeaveRequestService } from '../services/interfaces/ILeaveRequestService'
import { IUserRepository } from '../repositories/interfaces/IUserRepository'
import { ILeaveRequestRepository } from '../repositories/interfaces/ILeaveRequestRepository'
import { BcryptPasswordService } from '../services/implementations/BcryptPasswordService'
import { IPasswordService } from '../services/interfaces/IPasswordService'

export const setupContainer = () => {
  const container = new Container()

  // Register repositories
  container.bind<IUserRepository>(TYPES.UserRepository).to(UserRepository)
  container
    .bind<ILeaveRequestRepository>(TYPES.LeaveRequestRepository)
    .to(LeaveRequestRepository)

  // Register services
  container.bind<IUserService>(TYPES.UserService).to(UserService)
  container
    .bind<ILeaveRequestService>(TYPES.LeaveRequestService)
    .to(LeaveRequestService)
  container.bind<IAuthService>(TYPES.AuthService).to(AuthService)

  // Register controllers
  container.bind(TYPES.UserController).to(UserController)
  container.bind(TYPES.AuthController).to(AuthController)
  container.bind(TYPES.LeaveRequestController).to(LeaveRequestController)

  // Register password service
  container
    .bind<IPasswordService>(TYPES.PasswordService)
    .to(BcryptPasswordService)

  return container
}

export { Container }
