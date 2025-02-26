import { User } from '../../types'

export interface IAuthService {
  login(
    email: string,
    password: string
  ): Promise<{ token: string; user: Omit<User, 'password'> }>
  changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ): Promise<void>
  updateProfile(userId: number, profileData: Partial<User>): Promise<User>
  register(
    userData: Partial<User> & { password: string }
  ): Promise<Omit<User, 'password'>>
}
