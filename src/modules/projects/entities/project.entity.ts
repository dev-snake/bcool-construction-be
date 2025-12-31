import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';
import { ProjectType } from './project-type.entity';
import { ProjectStatus } from './project-status.entity';
import { ProjectContent } from './project-content.entity';
import { ProjectMedia } from './project-media.entity';
import { Service } from '../../services/entities/service.entity';

@Entity('projects')
export class Project extends BaseEntity {
  @Column({ unique: true, length: 150 })
  slug: string;

  @Column({ length: 255 })
  title: string;

  @Column({ name: 'short_description', type: 'text', nullable: true })
  shortDescription: string;

  @Column({ length: 255, nullable: true })
  location: string;

  @Column({ length: 255, nullable: true })
  investor: string;

  @Column({ length: 255, nullable: true })
  scale: string;

  @Column({ name: 'project_type_id', nullable: true })
  projectTypeId: string;

  @ManyToOne(() => ProjectType, (type) => type.projects, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'project_type_id' })
  projectType: ProjectType;

  @Column({ name: 'status_id', nullable: true })
  statusId: string;

  @ManyToOne(() => ProjectStatus, (status) => status.projects, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'status_id' })
  status: ProjectStatus;

  @Column({ name: 'started_at', type: 'date', nullable: true })
  startedAt: Date;

  @Column({ name: 'completed_at', type: 'date', nullable: true })
  completedAt: Date;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ name: 'is_published', default: true })
  isPublished: boolean;

  @OneToMany(() => ProjectContent, (content) => content.project)
  contents: ProjectContent[];

  @OneToMany(() => ProjectMedia, (media) => media.project)
  media: ProjectMedia[];

  @ManyToMany(() => Service, (service) => service.projects)
  @JoinTable({
    name: 'project_services',
    joinColumn: { name: 'project_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'service_id', referencedColumnName: 'id' },
  })
  services: Service[];
}
