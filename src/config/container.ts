import { Container } from 'inversify'
import { TYPES } from './types'
import { AuthService } from '../services/implementations/AuthService'
import { UserService } from '../services/implementations/UserService'
import { LeaveRequestService } from '../services/implementations/LeaveRequestService'
import { HourRequestService } from '../services/implementations/HourRequestService'
import { UserController } from '../controllers/UserController'
import { AuthController } from '../controllers/AuthController'
import { LeaveRequestController } from '../controllers/LeaveRequestController'
import { HourRequestController } from '../controllers/HourRequestController'
import { UserRepository } from '../repositories/implementations/UserRepository'
import { LeaveRequestRepository } from '../repositories/implementations/LeaveRequestRepository'
import { HourRequestRepository } from '../repositories/implementations/HourRequestRepository'
import { IAuthService } from '../services/interfaces/IAuthService'
import { IUserService } from '../services/interfaces/IUserService'
import { ILeaveRequestService } from '../services/interfaces/ILeaveRequestService'
import { IHourRequestService } from '../services/interfaces/IHourRequestService'
import { IUserRepository } from '../repositories/interfaces/IUserRepository'
import { ILeaveRequestRepository } from '../repositories/interfaces/ILeaveRequestRepository'
import { IHourRequestRepository } from '../repositories/interfaces/IHourRequestRepository'
import { BcryptPasswordService } from '../services/implementations/BcryptPasswordService'
import { IPasswordService } from '../services/interfaces/IPasswordService'
import { StatsController } from '../controllers/StatsController'
import { StatsService } from '../services/implementations/StatsService'
import { IStatsService } from '../services/interfaces/IStatsService'
import { IHourRequestValidator } from '../services/interfaces/IHourRequestValidator'
import { HourRequestValidator } from '../services/HourRequestValidator'
import { ILeaveRequestValidator } from '../services/interfaces/ILeaveRequestValidator'
import { LeaveRequestValidator } from '../services/LeaveRequestValidator'
import { CloudinaryConfig } from './cloudinary'
import { IImageService } from '../services/interfaces/IImageService'
import { ImageService } from '../services/implementations/ImageService'

export const setupContainer = () => {
  const container = new Container()

  // Register repositories
  container.bind<IUserRepository>(TYPES.UserRepository).to(UserRepository)
  container
    .bind<ILeaveRequestRepository>(TYPES.LeaveRequestRepository)
    .to(LeaveRequestRepository)
  container
    .bind<IHourRequestRepository>(TYPES.HourRequestRepository)
    .to(HourRequestRepository)

  // Register services
  container.bind<IUserService>(TYPES.UserService).to(UserService)
  container
    .bind<ILeaveRequestService>(TYPES.LeaveRequestService)
    .to(LeaveRequestService)
  container
    .bind<IHourRequestService>(TYPES.HourRequestService)
    .to(HourRequestService)
  container.bind<IAuthService>(TYPES.AuthService).to(AuthService)

  // Register controllers
  container.bind(TYPES.UserController).to(UserController)
  container.bind(TYPES.AuthController).to(AuthController)
  container.bind(TYPES.LeaveRequestController).to(LeaveRequestController)
  container
    .bind<HourRequestController>(TYPES.HourRequestController)
    .to(HourRequestController)

  // Register password service
  container
    .bind<IPasswordService>(TYPES.PasswordService)
    .to(BcryptPasswordService)

  // Register Stats Service and Controller
  container.bind<IStatsService>(TYPES.StatsService).to(StatsService)
  container.bind(TYPES.StatsController).to(StatsController)

  //Validators (HourRequest & LeaveRequest)
  container
    .bind<IHourRequestValidator>(TYPES.HourRequestValidator)
    .to(HourRequestValidator)

  container
    .bind<ILeaveRequestValidator>(TYPES.LeaveRequestValidator)
    .to(LeaveRequestValidator)

  //Image Service
  container
    .bind<CloudinaryConfig>(TYPES.CloudinaryConfig)
    .to(CloudinaryConfig)
    .inSingletonScope()
  container
    .bind<IImageService>(TYPES.ImageService)
    .to(ImageService)
    .inSingletonScope()

  return container
}

export { Container }
