import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';
import { Contact } from './contact.entity';

@Entity('contact_statuses')
export class ContactStatus extends BaseEntity {
  @Column({ length: 100 })
  name: string;

  @OneToMany(() => Contact, (contact) => contact.status)
  contacts: Contact[];
}
