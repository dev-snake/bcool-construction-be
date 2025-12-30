import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('activity_logs')
export class Log extends BaseEntity {
  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => User, (user) => user.activityLogs, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 100, nullable: true })
  module: string;

  @Column({ length: 50, nullable: true })
  action: string;

  @Column({ name: 'record_id', nullable: true })
  recordId: string;

  @Column({ name: 'ip_address', type: 'inet', nullable: true })
  ipAddress: string;
}
