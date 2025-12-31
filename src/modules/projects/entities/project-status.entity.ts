import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';
import { Project } from './project.entity';

@Entity('project_statuses')
export class ProjectStatus extends BaseEntity {
  @Column({ unique: true, length: 50 })
  code: string;

  @Column({ length: 100 })
  name: string;

  @OneToMany(() => Project, (project) => project.status)
  projects: Project[];
}
