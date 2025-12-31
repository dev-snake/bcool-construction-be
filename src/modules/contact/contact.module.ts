import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { ContactTypesController } from './contact-types.controller';
import { ContactStatusesController } from './contact-statuses.controller';
import { ContactService } from './contact.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contact } from './entities/contact.entity';
import { ContactType } from './entities/contact-type.entity';
import { ContactStatus } from './entities/contact-status.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contact, ContactType, ContactStatus])],
  controllers: [
    ContactController,
    ContactTypesController,
    ContactStatusesController,
  ],
  providers: [ContactService],
  exports: [ContactService],
})
export class ContactModule {}
