import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../common/base/base.service';
import { PaginationUtil } from '../../common/utils/pagination.util';
import { Page } from './entities/page.entity';
import { PageSection } from './entities/page-section.entity';
import { Banner } from './entities/banner.entity';
import { Counter } from './entities/counter.entity';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';
import { CreateCounterDto, UpdateCounterDto } from './dto/counter.dto';
import {
  CreatePageSectionDto,
  UpdatePageSectionDto,
  PageQueryDto,
  CreatePageDto,
  UpdatePageDto,
} from './dto/page.dto';
import { Branch } from './entities/branch.entity';
import { CreateBranchDto, UpdateBranchDto } from './dto/branch.dto';

@Injectable()
export class CmsService extends BaseService<Page> {
  constructor(
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
    @InjectRepository(PageSection)
    private readonly sectionRepository: Repository<PageSection>,
    @InjectRepository(Banner)
    private readonly bannerRepository: Repository<Banner>,
    @InjectRepository(Counter)
    private readonly counterRepository: Repository<Counter>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
  ) {
    super(pageRepository);
  }

  // PAGES
  async findAllPages(query: PageQueryDto) {
    const { search } = query;
    const { skip, take } = PaginationUtil.getSkipTake(query.page, query.limit);

    const queryBuilder = this.pageRepository.createQueryBuilder('page');

    if (search) {
      queryBuilder.where(
        'page.title ILIKE :search OR page.slug ILIKE :search',
        { search: `%${search}%` },
      );
    }

    queryBuilder.orderBy('page.createdAt', 'DESC');
    queryBuilder.skip(skip).take(take);

    const [items, total] = await queryBuilder.getManyAndCount();
    return { items, total };
  }

  async findPageBySlug(slug: string) {
    const page = await this.pageRepository.findOne({
      where: { slug, isPublished: true },
      relations: ['sections'],
    });
    if (!page) throw new NotFoundException('Page not found');
    page.sections.sort((a, b) => a.sortOrder - b.sortOrder);
    return page;
  }

  async findPageById(id: string) {
    const page = await this.pageRepository.findOne({
      where: { id } as any,
      relations: ['sections'],
    });
    if (!page) throw new NotFoundException('Page not found');
    page.sections.sort((a, b) => a.sortOrder - b.sortOrder);
    return page;
  }

  async createPage(dto: CreatePageDto) {
    const page = this.pageRepository.create(dto);
    return this.pageRepository.save(page);
  }

  async updatePage(id: string, dto: UpdatePageDto) {
    await this.pageRepository.update(id, dto);
    return this.findPageById(id);
  }

  // PAGE SECTIONS
  async addSection(pageId: string, data: CreatePageSectionDto) {
    const page = await this.pageRepository.findOne({
      where: { id: pageId } as any,
    });
    if (!page) throw new NotFoundException('Page not found');
    const section = this.sectionRepository.create({ ...data, pageId });
    return this.sectionRepository.save(section);
  }

  async updateSection(id: string, data: UpdatePageSectionDto) {
    await this.sectionRepository.update(id, data);
    return this.sectionRepository.findOne({ where: { id } as any });
  }

  async removeSection(id: string) {
    return this.sectionRepository.delete(id);
  }

  // BANNERS
  async findAllBanners(admin = false) {
    const where: any = {};
    if (!admin) where.isActive = true;

    return this.bannerRepository.find({
      where,
      order: { sortOrder: 'ASC' },
    });
  }

  async createBanner(dto: CreateBannerDto) {
    const banner = this.bannerRepository.create(dto);
    return this.bannerRepository.save(banner);
  }

  async updateBanner(id: string, dto: UpdateBannerDto) {
    await this.bannerRepository.update(id, dto);
    return this.bannerRepository.findOne({ where: { id } as any });
  }

  async removeBanner(id: string) {
    return this.bannerRepository.delete(id);
  }

  // COUNTERS
  async findAllCounters(admin = false) {
    const where: any = {};
    if (!admin) where.isActive = true;

    return this.counterRepository.find({
      where,
      order: { sortOrder: 'ASC' },
    });
  }

  async createCounter(dto: CreateCounterDto) {
    const counter = this.counterRepository.create(dto);
    return this.counterRepository.save(counter);
  }

  async updateCounter(id: string, dto: UpdateCounterDto) {
    await this.counterRepository.update(id, dto);
    return this.counterRepository.findOne({ where: { id } as any });
  }

  async removeCounter(id: string) {
    return this.counterRepository.delete(id);
  }

  // Aggregate Home Data
  async getHomeData() {
    const [banners, counters] = await Promise.all([
      this.findAllBanners(),
      this.findAllCounters(),
    ]);

    const homePage = await this.pageRepository.findOne({
      where: { slug: 'home', isPublished: true },
      relations: ['sections'],
    });

    if (homePage) {
      homePage.sections = homePage.sections
        .filter((s) => s.isVisible)
        .sort((a, b) => a.sortOrder - b.sortOrder);
    }

    return {
      banners,
      counters,
      sections: homePage?.sections || [],
    };
  }

  // BRANCHES
  async findAllBranches(admin = false) {
    const where: any = {};
    if (!admin) where.isVisible = true;

    return this.branchRepository.find({
      where,
      order: { sortOrder: 'ASC' },
    });
  }

  async findBranchById(id: string) {
    const branch = await this.branchRepository.findOne({ where: { id } as any });
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  async createBranch(dto: CreateBranchDto) {
    const branch = this.branchRepository.create(dto);
    return this.branchRepository.save(branch);
  }

  async updateBranch(id: string, dto: UpdateBranchDto) {
    await this.branchRepository.update(id, dto);
    return this.branchRepository.findOne({ where: { id } as any });
  }

  async removeBranch(id: string) {
    return this.branchRepository.delete(id);
  }
}
