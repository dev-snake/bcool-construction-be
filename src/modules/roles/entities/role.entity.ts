import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';

@Entity('roles')
export class Role extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('simple-array', { nullable: true })
  permissions: string[];
}
