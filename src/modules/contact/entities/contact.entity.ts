import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';

@Entity('contacts')
export class Contact extends BaseEntity {
  @Column()
  fullName: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: 'unread' })
  status: string;
}
