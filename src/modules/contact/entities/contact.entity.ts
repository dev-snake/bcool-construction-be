import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';
import { ContactType } from './contact-type.entity';
import { ContactStatus } from './contact-status.entity';

@Entity('contacts')
export class Contact extends BaseEntity {
  @Column({ name: 'full_name', length: 255, nullable: true })
  fullName: string;

  @Column({ length: 50, nullable: true })
  phone: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ name: 'type_id', nullable: true })
  typeId: number;

  @ManyToOne(() => ContactType, (type) => type.contacts, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'type_id' })
  type: ContactType;

  @Column({ name: 'status_id', nullable: true })
  statusId: number;

  @ManyToOne(() => ContactStatus, (status) => status.contacts, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'status_id' })
  status: ContactStatus;
}
