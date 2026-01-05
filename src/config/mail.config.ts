import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT || '587', 10),
  user: process.env.MAIL_USER,
  pass: process.env.MAIL_PASSWORD,
  from: process.env.MAIL_FROM,
  notificationEmail: process.env.CONTACT_NOTIFICATION_EMAIL || 'dangvanhaufpt2019@gmail.com',
}));
