import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { BaseService } from '../../common/base/base.service';
import { Contact } from './entities/contact.entity';
import { ContactType } from './entities/contact-type.entity';
import { ContactStatus } from './entities/contact-status.entity';
import {
  CreateContactDto,
  UpdateContactDto,
  ContactQueryDto,
} from './dto/contact.dto';
import {
  CreateContactTypeDto,
  UpdateContactTypeDto,
} from './dto/contact-type.dto';
import {
  CreateContactStatusDto,
  UpdateContactStatusDto,
} from './dto/contact-status.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ContactStatusName } from '../../common/enums/contact-status.enum';
import { QueueName } from '../../common/enums/queue.enum';
import { JobName } from '../../common/enums/job.enum';

@Injectable()
export class ContactService extends BaseService<Contact> {
  protected searchableFields = ['fullName', 'email', 'phone'];

  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    @InjectRepository(ContactType)
    private readonly typeRepository: Repository<ContactType>,
    @InjectRepository(ContactStatus)
    private readonly statusRepository: Repository<ContactStatus>,
    @InjectQueue(QueueName.CONTACTS)
    private readonly contactQueue: Queue,
  ) {
    super(contactRepository);
  }

  protected getQueryBuilder(
    alias: string = 'contact',
  ): SelectQueryBuilder<Contact> {
    return this.contactRepository
      .createQueryBuilder(alias)
      .leftJoinAndSelect(`${alias}.type`, 'type')
      .leftJoinAndSelect(`${alias}.status`, 'status');
  }

  // PUBLIC
  async submitForm(data: CreateContactDto) {
    const contact = this.contactRepository.create(data);

    // Set default status if possible (New)
    const defaultStatus = await this.statusRepository.findOne({
      where: { name: ContactStatusName.NEW },
    });
    if (defaultStatus) {
      contact.statusId = defaultStatus.id;
    }

    const saved = await this.contactRepository.save(contact);

    // Dispatch background job
    await this.contactQueue.add(JobName.CONTACT_SUBMISSION, {
      contactId: saved.id,
      fullName: saved.fullName,
      email: saved.email,
      phone: saved.phone,
      message: saved.message,
    });

    return saved;
  }

  // ADMIN - MANAGE SUBMISSIONS
  async findPaginatedSubmissions(query: ContactQueryDto) {
    const { typeId, statusId, email, fullName, startDate, endDate } = query;

    const { items, total } = await this.findPaginated(
      query,
      'contact',
      (qb) => {
        if (typeId) qb.andWhere('contact.typeId = :typeId', { typeId });
        if (statusId) qb.andWhere('contact.statusId = :statusId', { statusId });
        if (email)
          qb.andWhere('contact.email ILIKE :email', { email: `%${email}%` });
        if (fullName)
          qb.andWhere('contact.fullName ILIKE :fullName', {
            fullName: `%${fullName}%`,
          });

        if (startDate) {
          qb.andWhere('contact.createdAt >= :startDate', { startDate });
        }
        if (endDate) {
          qb.andWhere('contact.createdAt <= :endDate', { endDate });
        }
      },
    );

    return {
      items,
      meta: {
        total,
        page: query.page || 1,
        limit: query.limit || 10,
        totalPages: Math.ceil(total / (query.limit || 10)),
      },
    };
  }

  async findDetail(id: string) {
    const contact = await this.contactRepository.findOne({
      where: { id } as any,
      relations: ['type', 'status'],
    });
    if (!contact) throw new NotFoundException('Contact submission not found');
    return contact;
  }

  async updateSubmission(id: string, data: UpdateContactDto) {
    await this.contactRepository.update(id, data);
    return this.findDetail(id);
  }

  // CONTACT TYPES
  async findAllTypes() {
    return this.typeRepository.find({ order: { name: 'ASC' } });
  }

  async createType(dto: CreateContactTypeDto) {
    const type = this.typeRepository.create(dto);
    return this.typeRepository.save(type);
  }

  async updateType(id: string, dto: UpdateContactTypeDto) {
    await this.typeRepository.update(id, dto);
    return this.typeRepository.findOne({ where: { id } });
  }

  async removeType(id: string) {
    return this.typeRepository.delete(id);
  }

  // CONTACT STATUSES
  async findAllStatuses() {
    return this.statusRepository.find({ order: { name: 'ASC' } });
  }

  async createStatus(dto: CreateContactStatusDto) {
    const status = this.statusRepository.create(dto);
    return this.statusRepository.save(status);
  }

  async updateStatus(id: string, dto: UpdateContactStatusDto) {
    await this.statusRepository.update(id, dto);
    return this.statusRepository.findOne({ where: { id } });
  }

  async removeStatus(id: string) {
    return this.statusRepository.delete(id);
  }
}
