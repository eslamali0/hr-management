import { User } from '../../types'

export interface IAuthService {
  login(
    email: string,
    password: string
  ): Promise<{
    token: string
    user: Pick<User, 'id' | 'name' | 'email' | 'role' | 'departmentId'>
  }>
  changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ): Promise<void>
  updateProfile(userId: number, profileData: Partial<User>): Promise<void>
  register(
    userData: Partial<User> & { password: string }
  ): Promise<Omit<User, 'password'>>
}
