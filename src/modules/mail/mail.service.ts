import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('mail.host');
    if (host) {
      this.transporter = nodemailer.createTransport({
        host: host,
        port: this.configService.get<number>('mail.port'),
        secure: this.configService.get<number>('mail.port') === 465,
        auth: {
          user: this.configService.get<string>('mail.user'),
          pass: this.configService.get<string>('mail.pass'),
        },
      });
    } else {
      this.logger.warn('SMTP Host not configured. Mail service will not send emails.');
    }
  }

  async sendMail(to: string, subject: string, html: string) {
    if (!this.transporter) {
      this.logger.warn(`Skipping email to ${to} as transporter is not configured.`);
      return null;
    }
    try {
      const from = this.configService.get<string>('mail.from');
      const info = await this.transporter.sendMail({
        from: `"Bcool Construction" <${from}>`,
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error('Error sending email:', error);
      throw error;
    }
  }

  async sendContactNotification(contactData: {
    fullName: string;
    email: string;
    phone?: string;
    type?: string;
    message?: string;
  }) {
    const notificationEmail = this.configService.get<string>('mail.notificationEmail');
    const subject = `New Contact Submission from ${contactData.fullName}`;
    
    const html = `
      <h3>New Contact Submission Details:</h3>
      <p><b>Full Name:</b> ${contactData.fullName}</p>
      <p><b>Email:</b> ${contactData.email}</p>
      <p><b>Phone:</b> ${contactData.phone || 'N/A'}</p>
      <p><b>Type:</b> ${contactData.type || 'N/A'}</p>
      <p><b>Message:</b></p>
      <p>${contactData.message || 'No message provided.'}</p>
      <hr>
      <p>Sent from Bcool Construction System</p>
    `;

    return this.sendMail(notificationEmail as string, subject, html);
  }
}
