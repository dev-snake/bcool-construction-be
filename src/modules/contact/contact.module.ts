import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ContactController } from './contact.controller';
import { ContactTypesController } from './contact-types.controller';
import { ContactStatusesController } from './contact-statuses.controller';
import { ContactService } from './contact.service';
import { ContactProcessor } from './contact.processor';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contact } from './entities/contact.entity';
import { ContactType } from './entities/contact-type.entity';
import { ContactStatus } from './entities/contact-status.entity';
import { MailModule } from '../mail/mail.module';
import { QueueName } from '../../common/enums/queue.enum';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contact, ContactType, ContactStatus]),
    BullModule.registerQueue({
      name: QueueName.CONTACTS,
    }),
    MailModule,
  ],
  controllers: [
    ContactController,
    ContactTypesController,
    ContactStatusesController,
  ],
  providers: [ContactService, ContactProcessor],
  exports: [ContactService],
})
export class ContactModule {}
