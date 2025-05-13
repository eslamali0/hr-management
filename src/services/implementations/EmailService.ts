import { injectable } from 'inversify'
import { IEmailService } from '../interfaces/IEmail.Service'
import nodemailer from 'nodemailer'
import { User } from '@prisma/client'

@injectable()
export class EmailService implements IEmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || '587'),
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: true,
        minVersion: 'TLSv1.2',
      },
      logger: true,
      debug: true,
    })
  }

  async sendPasswordSetupEmail(user: User, token: string): Promise<void> {
    const baseUrl = process.env.FRONTEND_URL
    const resetLink = `${baseUrl}/forget-password?token=${token}`

    const html = `
      <h1>Welcome to HR Management System</h1>
      <p>Hello ${user.name},</p>
      <p>An account has been created for you. Please click the link below to set your password:</p>
      <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Set Your Password</a>
      <p>This link will expire in 24 hours.</p>
      <p>If you did not request this account, please ignore this email.</p>
    `

    await this.sendEmail(
      user.email,
      'Welcome to HR Management System - Set Your Password',
      html
    )
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    const mailOptions: nodemailer.SendMailOptions = {
      from: {
        name: 'HR Management System',
        address: process.env.EMAIL_FROM || '',
      },
      to,
      subject,
      html,
      headers: {
        'X-Priority': '1',
      },
    }

    try {
      await this.transporter.sendMail(mailOptions)
    } catch (error) {
      console.log('Error sending email', error)
      throw new Error('Failed to send email')
    }
  }
}
