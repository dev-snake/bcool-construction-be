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
    const notificationEmail =
      this.configService.get<string>('mail.notificationEmail');
    const subject = `🔥 Yêu cầu liên hệ mới: ${contactData.fullName}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
              body { 
                  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                  line-height: 1.6; 
                  color: #1e293b; 
                  margin: 0; 
                  padding: 0; 
                  background-color: #f1f5f9;
              }
              .wrapper {
                  width: 100%;
                  table-layout: fixed;
                  background-color: #f1f5f9;
                  padding-bottom: 40px;
              }
              .container { 
                  max-width: 600px; 
                  margin: 0 auto; 
                  background-color: #ffffff;
                  border-radius: 16px; 
                  overflow: hidden; 
                  margin-top: 40px;
                  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
              }
              .top-bar {
                  height: 6px;
                  background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);
              }
              .header { 
                  padding: 40px 40px 20px; 
                  text-align: left; 
              }
              .logo {
                  font-size: 24px;
                  font-weight: 800;
                  color: #0f172a;
                  text-transform: uppercase;
                  letter-spacing: -0.5px;
                  margin-bottom: 8px;
              }
              .logo span { color: #f59e0b; }
              .badge {
                  display: inline-block;
                  padding: 4px 12px;
                  background-color: #fef3c7;
                  color: #d97706;
                  border-radius: 20px;
                  font-size: 11px;
                  font-weight: 700;
                  text-transform: uppercase;
                  margin-top: 10px;
              }
              .content { padding: 0 40px 40px; }
              .title {
                  font-size: 22px;
                  font-weight: 700;
                  color: #0f172a;
                  margin: 20px 0 30px;
              }
              .data-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              .data-row td { padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
              .label { 
                  width: 120px;
                  font-size: 13px; 
                  color: #64748b; 
                  font-weight: 600;
                  text-transform: uppercase;
              }
              .value { 
                  font-size: 15px; 
                  color: #0f172a; 
                  font-weight: 500; 
              }
              .message-title {
                  font-size: 14px;
                  font-weight: 700;
                  color: #0f172a;
                  margin-bottom: 12px;
                  display: flex;
                  align-items: center;
              }
              .message-content { 
                  background-color: #f8fafc; 
                  padding: 24px; 
                  border-radius: 12px; 
                  border: 1px solid #e2e8f0;
                  color: #334155;
                  font-style: italic;
                  line-height: 1.8;
                  font-size: 15px;
              }
              .footer { 
                  padding: 30px 40px; 
                  background-color: #ffffff; 
                  border-top: 1px solid #f1f5f9;
                  text-align: center; 
                  font-size: 12px; 
                  color: #94a3b8; 
              }
              .btn {
                  display: inline-block;
                  padding: 14px 28px;
                  background-color: #0f172a;
                  color: #ffffff !important;
                  text-decoration: none;
                  border-radius: 8px;
                  font-weight: 600;
                  font-size: 14px;
                  margin-top: 30px;
              }
          </style>
      </head>
      <body>
          <div class="wrapper">
              <div class="container">
                  <div class="top-bar"></div>
                  <div class="header">
                      <div class="logo">BCOOL <span>CONSTRUCTION</span></div>
                      <div class="badge">Nội bộ - High Priority</div>
                  </div>
                  <div class="content">
                      <h2 class="title">Có một khách hàng vừa gửi thông tin liên hệ mới!</h2>
                      
                      <table class="data-table">
                          <tr class="data-row">
                              <td class="label">Khách hàng</td>
                              <td class="value">${contactData.fullName}</td>
                          </tr>
                          <tr class="data-row">
                              <td class="label">Email</td>
                              <td class="value">${contactData.email}</td>
                          </tr>
                          <tr class="data-row">
                              <td class="label">Điện thoại</td>
                              <td class="value">${contactData.phone || '—'}</td>
                          </tr>
                          <tr class="data-row">
                              <td class="label">Phân loại</td>
                              <td class="value">${contactData.type || 'Hỗ trợ chung'}</td>
                          </tr>
                      </table>

                      <div class="message-title">💬 Nội dung yêu cầu:</div>
                      <div class="message-content">
                          ${contactData.message ? contactData.message.replace(/\n/g, '<br>') : 'Không có nội dung mô tả.'}
                      </div>

                      <div style="text-align: center;">
                          <a href="mailto:${contactData.email}?subject=Re: Yêu cầu liên hệ tại Bcool" class="btn">PHẢN HỒI KHÁCH HÀNG NGAY</a>
                      </div>
                  </div>
                  <div class="footer">
                      <strong>Bcool Construction System</strong><br>
                      Địa chỉ: TP. Hồ Chí Minh, Việt Nam<br>
                      Đây là email tự động, vui lòng không trả lời trực tiếp vào email này.
                  </div>
              </div>
          </div>
      </body>
      </html>
    `;

    return this.sendMail(notificationEmail as string, subject, html);
  }
}
