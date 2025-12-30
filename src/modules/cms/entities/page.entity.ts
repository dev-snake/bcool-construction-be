import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';
import { PageSection } from './page-section.entity';

@Entity('pages')
export class Page extends BaseEntity {
  @Column({ unique: true, length: 100 })
  slug: string;

  @Column({ length: 255 })
  title: string;

  @Column({ name: 'is_published', default: true })
  isPublished: boolean;

  @OneToMany(() => PageSection, (section) => section.page)
  sections: PageSection[];
}
