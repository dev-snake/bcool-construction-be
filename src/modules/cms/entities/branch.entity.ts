import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';

@Entity('branches')
export class Branch extends BaseEntity {
  @Column({ length: 255 })
  name: string;

  @Column({ length: 500 })
  address: string;

  @Column({ length: 50, nullable: true })
  phone: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ name: 'working_hours', length: 255, nullable: true })
  workingHours: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ name: 'is_main_branch', default: false })
  isMainBranch: boolean;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_visible', default: true })
  isVisible: boolean;
}
