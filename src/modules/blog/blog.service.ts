import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  LessThanOrEqual,
  SelectQueryBuilder,
} from 'typeorm';
import { BaseService } from '../../common/base/base.service';
import { Post } from './entities/post.entity';
import { PostCategory } from './entities/post-category.entity';
import { StringUtil } from '../../common/utils/string.util';
import {
  PostQueryDto,
  CreatePostDto,
  UpdatePostDto,
} from './dto/blog-post.dto';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/blog-category.dto';
import { RedisCacheService } from '../../common/services/redis-cache.service';
import { CACHE_TTL } from '../../common/constants/system.constant';

@Injectable()
export class BlogService extends BaseService<Post> {
  protected searchableFields = ['title', 'slug'];

  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(PostCategory)
    private readonly categoryRepository: Repository<PostCategory>,
    private readonly cacheService: RedisCacheService,
  ) {
    super(postRepository);
  }

  protected getQueryBuilder(alias: string = 'post'): SelectQueryBuilder<Post> {
    return this.postRepository
      .createQueryBuilder(alias)
      .leftJoinAndSelect(`${alias}.category`, 'category');
  }

  private async clearCache() {
    await this.cacheService.delByPattern('blog:*');
  }

  // --- POSTS ---

  async findAllPosts(query: PostQueryDto) {
    const cacheKey = `blog:list:${JSON.stringify(query)}`;
    const cached = await this.cacheService.get<{ items: Post[]; total: number }>(
      cacheKey,
    );
    if (cached) return cached;

    const { categoryId, isPublished } = query;

    const result = await this.findPaginated(query, 'post', (qb) => {
      if (categoryId) qb.andWhere('post.categoryId = :categoryId', { categoryId });
      if (isPublished !== undefined)
        qb.andWhere('post.isPublished = :isPublished', { isPublished });
    });

    await this.cacheService.set(cacheKey, result, CACHE_TTL.ONE_HOUR);
    return result;
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
    const cacheKey = `blog:detail:${slug}`;
    const cached = await this.cacheService.get<Post>(cacheKey);
    if (cached) return cached;

    const post = await this.postRepository.findOne({
      where: { slug },
      relations: ['category'],
    });
    if (!post) throw new NotFoundException('Post not found');

    await this.cacheService.set(cacheKey, post, CACHE_TTL.ONE_HOUR);
    return post;
  }

  async findPostById(id: string) {
    const post = await this.postRepository.findOne({
      where: { id } as any,
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
    const saved = await this.postRepository.save(post);
    await this.clearCache();
    return saved;
  }

  async updatePost(id: string, data: UpdatePostDto) {
    const post = await this.postRepository.findOneBy({ id } as any);
    if (!post) throw new NotFoundException('Post not found');

    if (data.title && !data.slug) {
      data.slug = StringUtil.slugify(data.title);
    }

    if (data.slug && data.slug !== post.slug) {
      const existing = await this.postRepository.findOne({
        where: { slug: data.slug },
      });
      if (existing) throw new ConflictException('Slug already exists');
    }

    Object.assign(post, data);
    const saved = await this.postRepository.save(post);
    await this.clearCache();
    return saved;
  }

  async deletePost(id: string) {
    const post = await this.postRepository.findOneBy({ id } as any);
    if (!post) throw new NotFoundException('Post not found');
    const result = await this.postRepository.softRemove(post);
    await this.clearCache();
    return result;
  }

  // --- CATEGORIES ---

  async findAllCategories() {
    const cacheKey = 'blog:categories:all';
    const cached = await this.cacheService.get<PostCategory[]>(cacheKey);
    if (cached) return cached;

    const categories = await this.categoryRepository.find({
      order: { name: 'ASC' },
    });
    await this.cacheService.set(cacheKey, categories, CACHE_TTL.ONE_HOUR);
    return categories;
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
    const saved = await this.categoryRepository.save(cat);
    await this.clearCache();
    return saved;
  }

  async updateCategory(id: string, data: UpdateCategoryDto) {
    const category = await this.findCategoryById(id);

    if (data.name && !data.slug) {
      data.slug = StringUtil.slugify(data.name);
    }

    if (data.slug && data.slug !== category.slug) {
      const existing = await this.categoryRepository.findOne({
        where: { slug: data.slug },
      });
      if (existing) throw new ConflictException('Category slug already exists');
    }

    Object.assign(category, data);
    const saved = await this.categoryRepository.save(category);
    await this.clearCache();
    return saved;
  }

  async deleteCategory(id: string) {
    const category = await this.findCategoryById(id);
    // Check if category has posts
    const postsCount = await this.postRepository.count({
      where: { categoryId: id },
    });
    if (postsCount > 0) {
      throw new ConflictException('Cannot delete category with posts');
    }
    const result = await this.categoryRepository.remove(category);
    await this.clearCache();
    return result;
  }
}
