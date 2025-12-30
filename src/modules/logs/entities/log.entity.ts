import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';

@Entity('activity_logs')
export class Log extends BaseEntity {
  @Column({ nullable: true })
  userId: string;

  @Column()
  action: string;

  @Column({ type: 'json', nullable: true })
  metadata: any;
}
