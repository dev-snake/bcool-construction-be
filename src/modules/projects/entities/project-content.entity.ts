import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';
import { Project } from './project.entity';

@Entity('project_contents')
export class ProjectContent extends BaseEntity {
  @Column({ name: 'project_id' })
  projectId: string;

  @ManyToOne(() => Project, (project) => project.contents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ type: 'text' })
  content: string;
}
