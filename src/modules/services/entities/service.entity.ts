import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';

@Entity('services')
export class Service extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ default: true })
  isActive: boolean;
}
