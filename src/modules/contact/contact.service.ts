import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
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

@Injectable()
export class ContactService extends BaseService<Contact> {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    @InjectRepository(ContactType)
    private readonly typeRepository: Repository<ContactType>,
    @InjectRepository(ContactStatus)
    private readonly statusRepository: Repository<ContactStatus>,
    @InjectQueue('contacts')
    private readonly contactQueue: Queue,
  ) {
    super(contactRepository);
  }

  // PUBLIC
  async submitForm(data: CreateContactDto) {
    const contact = this.contactRepository.create(data);
    
    // Set default status if possible (New)
    const defaultStatus = await this.statusRepository.findOne({
      where: { name: 'Mới' }, // Adjusted to match Vietnamese seed
    });
    if (defaultStatus) {
      contact.statusId = defaultStatus.id;
    }
    
    const saved = await this.contactRepository.save(contact);
    
    // Dispatch background job
    await this.contactQueue.add('submission', {
      contactId: saved.id,
      fullName: saved.fullName,
      email: saved.email,
    });

    return saved;
  }

  // ADMIN - MANAGE SUBMISSIONS
  async findPaginatedSubmissions(query: ContactQueryDto) {
    const { page = 1, limit = 10, typeId, statusId, email, fullName, search } = query;
    
    const qb = this.contactRepository.createQueryBuilder('contact')
      .leftJoinAndSelect('contact.type', 'type')
      .leftJoinAndSelect('contact.status', 'status');

    if (typeId) qb.andWhere('contact.typeId = :typeId', { typeId });
    if (statusId) qb.andWhere('contact.statusId = :statusId', { statusId });
    if (email) qb.andWhere('contact.email LIKE :email', { email: `%${email}%` });
    if (fullName) qb.andWhere('contact.fullName LIKE :fullName', { fullName: `%${fullName}%` });
    if (search) {
      qb.andWhere('(contact.email LIKE :search OR contact.fullName LIKE :search OR contact.phone LIKE :search)', { search: `%${search}%` });
    }

    qb.orderBy('contact.createdAt', 'DESC')
      .take(limit)
      .skip((page - 1) * limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
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
