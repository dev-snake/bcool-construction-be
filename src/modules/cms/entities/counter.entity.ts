import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';

@Entity('counters')
export class Counter extends BaseEntity {
  @Column({ length: 255 })
  label: string;

  @Column()
  value: number;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
