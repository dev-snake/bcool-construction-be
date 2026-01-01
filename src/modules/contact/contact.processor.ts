import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

@Processor('contacts')
export class ContactProcessor extends WorkerHost {
  private readonly logger = new Logger(ContactProcessor.name);

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing contact submission job: ${job.id}`);
    
    const { contactId, fullName, email } = job.data;
    
    // Simulating background task (e.g., sending email)
    this.logger.log(`Sending notification for contact: ${contactId} (${fullName} <${email}>)`);
    
    // Placeholder for actual email service call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    this.logger.log(`Contact submission job ${job.id} completed.`);
    return { success: true };
  }
}
