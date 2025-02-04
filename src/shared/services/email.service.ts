import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    try {
      const verificationUrl = `${this.configService.get('APP_URL', 'http://localhost:3000')}/verify-email?token=${token}`;

      await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM', 'noreply@example.com'),
        to: email,
        subject: 'Verify your email address',
        html: `
          <p>Please click the link below to verify your email address:</p>
          <a href="${verificationUrl}">${verificationUrl}</a>
        `,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send verification email to ${email}:`,
        error,
      );
    }
  }

  async sendEmployeeInvitation(email: string, token: string): Promise<void> {
    try {
      const activationUrl = `${this.configService.get('APP_URL', 'http://localhost:3000')}/activate-employee?token=${token}`;

      await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM', 'noreply@example.com'),
        to: email,
        subject: 'You have been invited to join the company',
        html: `
          <p>Please click the link below to set up your account:</p>
          <a href="${activationUrl}">${activationUrl}</a>
        `,
      });
    } catch (error) {
      this.logger.error(`Failed to send invitation email to ${email}:`, error);
    }
  }
}
