import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../common/base/base.service';
import { Contact } from './entities/contact.entity';
import { ContactType } from './entities/contact-type.entity';
import { ContactStatus } from './entities/contact-status.entity';

@Injectable()
export class ContactService extends BaseService<Contact> {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    @InjectRepository(ContactType)
    private readonly typeRepository: Repository<ContactType>,
    @InjectRepository(ContactStatus)
    private readonly statusRepository: Repository<ContactStatus>,
  ) {
    super(contactRepository);
  }

  // PUBLIC
  async submitForm(data: any) {
    const contact = this.contactRepository.create(data);
    return this.contactRepository.save(contact);
  }

  // TYPES & STATUSES
  async findAllTypes() {
    return this.typeRepository.find();
  }

  async findAllStatuses() {
    return this.statusRepository.find();
  }
}
