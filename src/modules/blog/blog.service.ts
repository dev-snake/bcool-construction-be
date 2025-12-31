import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, Like } from 'typeorm';
import { BaseService } from '../../common/base/base.service';
import { Post } from './entities/post.entity';
import { PostCategory } from './entities/post-category.entity';
import { StringUtil } from '../../common/utils/string.util';
import { PostQueryDto, CreatePostDto, UpdatePostDto } from './dto/blog-post.dto';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/blog-category.dto';
import { PaginationUtil } from '../../common/utils/pagination.util';

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

  // --- POSTS ---

  async findAllPosts(query: PostQueryDto) {
    const { skip, take } = PaginationUtil.getSkipTake(query.page, query.limit);
    const where: any = {};

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.isPublished !== undefined) {
      where.isPublished = query.isPublished;
    }

    if (query.search) {
      where.title = Like(`%${query.search}%`);
    }

    const [items, total] = await this.postRepository.findAndCount({
      where,
      relations: ['category'],
      order: { createdAt: 'DESC' },
      skip,
      take,
    });

    return { items, total };
  }

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
      where: { slug },
      relations: ['category'],
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async createPost(data: CreatePostDto) {
    const slug = data.slug || StringUtil.slugify(data.title);
    
    const existing = await this.postRepository.findOne({ where: { slug } });
    if (existing) {
      throw new ConflictException('Slug already exists');
    }

    const post = this.postRepository.create({
      ...data,
      slug,
      publishAt: data.publishAt || (data.isPublished ? new Date() : undefined),
    } as any);
    return this.postRepository.save(post);
  }

  async updatePost(id: string, data: UpdatePostDto) {
    const post = await this.postRepository.findOneBy({ id } as any);
    if (!post) throw new NotFoundException('Post not found');

    if (data.title && !data.slug) {
      data.slug = StringUtil.slugify(data.title);
    }

    if (data.slug && data.slug !== post.slug) {
      const existing = await this.postRepository.findOne({ where: { slug: data.slug } });
      if (existing) throw new ConflictException('Slug already exists');
    }

    Object.assign(post, data);
    return this.postRepository.save(post);
  }

  async deletePost(id: string) {
    const post = await this.postRepository.findOneBy({ id } as any);
    if (!post) throw new NotFoundException('Post not found');
    return this.postRepository.softRemove(post);
  }

  // --- CATEGORIES ---

  async findAllCategories() {
    return this.categoryRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findCategoryById(id: string) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async createCategory(data: CreateCategoryDto) {
    const slug = data.slug || StringUtil.slugify(data.name);
    
    const existing = await this.categoryRepository.findOne({ where: { slug } });
    if (existing) {
      throw new ConflictException('Category slug already exists');
    }

    const cat = this.categoryRepository.create({
      ...data,
      slug,
    });
    return this.categoryRepository.save(cat);
  }

  async updateCategory(id: string, data: UpdateCategoryDto) {
    const category = await this.findCategoryById(id);
    
    if (data.name && !data.slug) {
      data.slug = StringUtil.slugify(data.name);
    }

    if (data.slug && data.slug !== category.slug) {
      const existing = await this.categoryRepository.findOne({ where: { slug: data.slug } });
      if (existing) throw new ConflictException('Category slug already exists');
    }

    Object.assign(category, data);
    return this.categoryRepository.save(category);
  }

  async deleteCategory(id: string) {
    const category = await this.findCategoryById(id);
    // Check if category has posts
    const postsCount = await this.postRepository.count({ where: { categoryId: id } });
    if (postsCount > 0) {
      throw new ConflictException('Cannot delete category with posts');
    }
    return this.categoryRepository.remove(category);
  }
}
