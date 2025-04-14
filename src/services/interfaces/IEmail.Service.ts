import { User } from '@prisma/client'

export interface IEmailService {
  sendPasswordSetupEmail(user: User, token: string): Promise<void>

  sendEmail(to: string, subject: string, html: string): Promise<void>
}
