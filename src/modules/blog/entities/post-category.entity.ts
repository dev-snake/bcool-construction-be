import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';
import { Post } from './post.entity';

@Entity('post_categories')
export class PostCategory extends BaseEntity {
  @Column({ length: 255 })
  name: string;

  @Column({ unique: true, length: 150 })
  slug: string;

  @OneToMany(() => Post, (post) => post.category)
  posts: Post[];
}
