import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Post } from './post.entity';

@Entity('post_categories')
export class PostCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ unique: true, length: 150 })
  slug: string;

  @OneToMany(() => Post, (post) => post.category)
  posts: Post[];
}
