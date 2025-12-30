import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';

@Entity('cms_contents')
export class Cms extends BaseEntity {
  @Column()
  slug: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: 'page' })
  type: string;
}
