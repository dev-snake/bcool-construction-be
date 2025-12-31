import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';

@Entity('banners')
export class Banner extends BaseEntity {
  @Column({ length: 255, nullable: true })
  title: string;

  @Column({ name: 'image_url', type: 'text' })
  imageUrl: string;

  @Column({ name: 'link_url', type: 'text', nullable: true })
  linkUrl: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
