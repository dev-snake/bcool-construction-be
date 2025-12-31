import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';
import { Service } from './service.entity';

@Entity('service_media')
export class ServiceMedia extends BaseEntity {
  @Column({ name: 'service_id' })
  serviceId: string;

  @ManyToOne(() => Service, (service) => service.media, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column({ name: 'media_url', type: 'text' })
  mediaUrl: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;
}
