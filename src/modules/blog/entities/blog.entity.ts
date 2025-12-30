import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';

@Entity('blogs')
export class Blog extends BaseEntity {
  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true })
  thumbnail: string;

  @Column({ default: 0 })
  views: number;
}
