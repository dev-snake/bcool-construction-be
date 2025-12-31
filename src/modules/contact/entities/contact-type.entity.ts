import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';
import { Contact } from './contact.entity';

@Entity('contact_types')
export class ContactType extends BaseEntity {
  @Column({ unique: true, length: 50 })
  code: string;

  @Column({ length: 100 })
  name: string;

  @OneToMany(() => Contact, (contact) => contact.type)
  contacts: Contact[];
}
