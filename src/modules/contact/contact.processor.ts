import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { MailService } from '../mail/mail.service';

@Processor('contacts')
export class ContactProcessor extends WorkerHost {
  private readonly logger = new Logger(ContactProcessor.name);

  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing contact submission job: ${job.id}`);
    
    const { contactId, fullName, email, phone, type, message } = job.data;
    
    // Sending email notification
    this.logger.log(`Sending notification for contact: ${contactId} (${fullName} <${email}>)`);
    
    try {
      await this.mailService.sendContactNotification({
        fullName,
        email,
        phone,
        type,
        message,
      });
      this.logger.log(`Contact submission job ${job.id} completed.`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to send contact notification: ${error.message}`);
      // Depending on retry policy, we might want to rethrow or return fail
      throw error; 
    }
  }
}
