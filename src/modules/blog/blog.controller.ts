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
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CheckPermission } from '../../common/decorators/permission.decorator';
import {
  SystemModule,
  PermissionAction,
} from '../../common/enums/permission.enum';
import { BaseQueryDto } from '../../common/dto/base-query.dto';
import { PaginationUtil } from '../../common/utils/pagination.util';

@ApiTags('Blog')
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  // PUBLIC
  @Get()
  @ApiOperation({ summary: 'Get all published posts' })
  async findAll(@Query() query: BaseQueryDto) {
    const { skip, take } = PaginationUtil.getSkipTake(query.page, query.limit);
    const [items, total] = await this.blogService.findActive({ skip, take });
    return { items, total };
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all post categories' })
  getCategories() {
    return this.blogService.findAllCategories();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get post details by slug' })
  findOne(@Param('slug') slug: string) {
    return this.blogService.findDetail(slug);
  }

  // ADMIN
  @UseGuards(JwtAuthGuard)
  @CheckPermission({ module: SystemModule.BLOG, action: PermissionAction.CREATE })
  @Post()
  create(@Body() data: any) {
    return this.blogService.create(data);
  }

  @UseGuards(JwtAuthGuard)
  @CheckPermission({ module: SystemModule.BLOG, action: PermissionAction.CREATE })
  @Post('categories')
  createCategory(@Body() data: any) {
    return this.blogService.createCategory(data);
  }
}
