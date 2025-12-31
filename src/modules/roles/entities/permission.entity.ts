import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';
import { SystemModule } from './module.entity';

@Entity('permissions')
export class Permission extends BaseEntity {
  @Column({ name: 'module_id' })
  moduleId: string;

  @ManyToOne(() => SystemModule, (module) => module.permissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'module_id' })
  module: SystemModule;

  @Column({ name: 'can_view', default: false })
  canView: boolean;

  @Column({ name: 'can_create', default: false })
  canCreate: boolean;

  @Column({ name: 'can_update', default: false })
  canUpdate: boolean;

  @Column({ name: 'can_delete', default: false })
  canDelete: boolean;
}
