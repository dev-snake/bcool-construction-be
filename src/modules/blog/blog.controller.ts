import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CheckPermission } from '../../common/decorators/permission.decorator';
import {
  SystemModule,
  PermissionAction,
} from '../../common/enums/permission.enum';
import {
  PostQueryDto,
  CreatePostDto,
  UpdatePostDto,
} from './dto/blog-post.dto';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/blog-category.dto';
import { PaginationUtil } from '../../common/utils/pagination.util';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Blog')
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  // --- PUBLIC ---

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all published posts' })
  async findAll(@Query() query: PostQueryDto) {
    const { skip, take } = PaginationUtil.getSkipTake(query.page, query.limit);
    const [items, total] = await this.blogService.findActive({ skip, take });
    return { items, total };
  }

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'Get all post categories' })
  getCategories() {
    return this.blogService.findAllCategories();
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get post details by slug' })
  findOne(@Param('slug') slug: string) {
    return this.blogService.findDetail(slug);
  }

  // --- ADMIN POSTS ---

  @ApiBearerAuth()
  @CheckPermission({ module: SystemModule.BLOG, action: PermissionAction.VIEW })
  @Get('admin/posts')
  @ApiOperation({ summary: 'Admin: Get all posts with filtering' })
  async findAllAdmin(@Query() query: PostQueryDto) {
    return this.blogService.findAllPosts(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @CheckPermission({
    module: SystemModule.BLOG,
    action: PermissionAction.CREATE,
  })
  @Post()
  @ApiOperation({ summary: 'Admin: Create new post' })
  create(@Body() data: CreatePostDto) {
    return this.blogService.createPost(data);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @CheckPermission({
    module: SystemModule.BLOG,
    action: PermissionAction.UPDATE,
  })
  @Put(':id')
  @ApiOperation({ summary: 'Admin: Update post' })
  update(@Param('id') id: string, @Body() data: UpdatePostDto) {
    return this.blogService.updatePost(id, data);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @CheckPermission({
    module: SystemModule.BLOG,
    action: PermissionAction.DELETE,
  })
  @Delete(':id')
  @ApiOperation({ summary: 'Admin: Delete post' })
  remove(@Param('id') id: string) {
    return this.blogService.deletePost(id);
  }

  // --- ADMIN CATEGORIES ---

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @CheckPermission({
    module: SystemModule.BLOG,
    action: PermissionAction.CREATE,
  })
  @Post('categories')
  @ApiOperation({ summary: 'Admin: Create new category' })
  createCategory(@Body() data: CreateCategoryDto) {
    return this.blogService.createCategory(data);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @CheckPermission({
    module: SystemModule.BLOG,
    action: PermissionAction.UPDATE,
  })
  @Put('categories/:id')
  @ApiOperation({ summary: 'Admin: Update category' })
  updateCategory(@Param('id') id: string, @Body() data: UpdateCategoryDto) {
    return this.blogService.updateCategory(id, data);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @CheckPermission({
    module: SystemModule.BLOG,
    action: PermissionAction.DELETE,
  })
  @Delete('categories/:id')
  @ApiOperation({ summary: 'Admin: Delete category' })
  removeCategory(@Param('id') id: string) {
    return this.blogService.deleteCategory(id);
  }
}
