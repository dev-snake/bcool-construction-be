import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { BaseService } from '../../common/base/base.service';
import { Post } from './entities/post.entity';
import { PostCategory } from './entities/post-category.entity';

@Injectable()
export class BlogService extends BaseService<Post> {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(PostCategory)
    private readonly categoryRepository: Repository<PostCategory>,
  ) {
    super(postRepository);
  }

  // PUBLIC
  async findActive(query: any) {
    const { skip, take } = query;
    return this.postRepository.findAndCount({
      where: {
        isPublished: true,
        publishAt: LessThanOrEqual(new Date()),
      },
      relations: ['category'],
      order: { publishAt: 'DESC' },
      skip,
      take,
    });
  }

  async findDetail(slug: string) {
    const post = await this.postRepository.findOne({
      where: { slug, isPublished: true },
      relations: ['category'],
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  // CATEGORIES
  async findAllCategories() {
    return this.categoryRepository.find();
  }

  async createCategory(data: any) {
    const cat = this.categoryRepository.create(data);
    return this.categoryRepository.save(cat);
  }
}
