import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';
import { Project } from './project.entity';

@Entity('project_media')
export class ProjectMedia extends BaseEntity {
  @Column({ name: 'project_id' })
  projectId: string;

  @ManyToOne(() => Project, (project) => project.media, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ name: 'media_url', type: 'text' })
  mediaUrl: string;

  @Column({ length: 255, nullable: true })
  caption: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;
}
