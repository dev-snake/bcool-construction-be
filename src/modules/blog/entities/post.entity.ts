import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';
import { PostCategory } from './post-category.entity';

@Entity('posts')
export class Post extends BaseEntity {
  @Column({ name: 'category_id', nullable: true })
  categoryId: string;

  @ManyToOne(() => PostCategory, (category) => category.posts, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category: PostCategory;

  @Column({ length: 255 })
  title: string;

  @Column({ unique: true, length: 150 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ name: 'thumbnail_url', type: 'text', nullable: true })
  thumbnailUrl: string;

  @Column({ name: 'is_published', default: false })
  isPublished: boolean;

  @Column({ name: 'publish_at', type: 'timestamptz', nullable: true })
  publishAt: Date;

  @Column({ name: 'allow_comment', default: true })
  allowComment: boolean;
}
