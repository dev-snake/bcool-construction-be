import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';
import { Permission } from './permission.entity';

@Entity('modules')
export class SystemModule extends BaseEntity {
  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @OneToMany(() => Permission, (permission) => permission.module)
  permissions: Permission[];
}
