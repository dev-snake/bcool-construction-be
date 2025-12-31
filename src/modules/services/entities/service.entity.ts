import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  ManyToMany,
} from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';
import { ServiceContent } from './service-content.entity';
import { ServiceMedia } from './service-media.entity';
import { Project } from '../../projects/entities/project.entity';

@Entity('services')
export class Service extends BaseEntity {
  @Column({ name: 'parent_id', nullable: true })
  @Index('idx_services_parent')
  parentId: string;

  @ManyToOne(() => Service, (service) => service.children, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id' })
  parent: Service;

  @OneToMany(() => Service, (service) => service.parent)
  children: Service[];

  @Column({ unique: true, length: 150 })
  slug: string;

  @Column({ length: 255 })
  title: string;

  @Column({ name: 'short_description', type: 'text', nullable: true })
  shortDescription: string;

  @Column({ name: 'icon_url', type: 'text', nullable: true })
  iconUrl: string;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => ServiceContent, (content) => content.service)
  contents: ServiceContent[];

  @OneToMany(() => ServiceMedia, (media) => media.service)
  media: ServiceMedia[];

  @ManyToMany(() => Project, (project) => project.services)
  projects: Project[];
}
