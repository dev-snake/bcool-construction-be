import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';
import { Page } from './page.entity';

@Entity('page_sections')
export class PageSection extends BaseEntity {
  @Column({ name: 'page_id' })
  pageId: string;

  @ManyToOne(() => Page, (page) => page.sections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'page_id' })
  page: Page;

  @Column({ length: 255, nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_visible', default: true })
  isVisible: boolean;
}
