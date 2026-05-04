import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../common/base/base.service';
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
import { SiteSetting } from './entities/site-setting.entity';
import { UpdateSiteSettingDto } from './dto/site-setting.dto';

@Injectable()
export class CmsService extends BaseService<Page> {
  protected searchableFields = ['title', 'slug'];

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
    @InjectRepository(SiteSetting)
    private readonly siteSettingRepository: Repository<SiteSetting>,
  ) {
    super(pageRepository);
  }

  // PAGES
  async findAllPages(query: PageQueryDto) {
    return this.findPaginated(query, 'page');
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
    const branch = await this.branchRepository.findOne({
      where: { id } as any,
    });
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

  // SITE SETTINGS
  async findAllSiteSettings() {
    return this.siteSettingRepository.find({
      order: { settingGroup: 'ASC', settingKey: 'ASC' },
    });
  }

  async findSiteSettingsByGroup(group: string) {
    return this.siteSettingRepository.find({
      where: { settingGroup: group },
      order: { settingKey: 'ASC' },
    });
  }

  async findSiteSettingByKey(key: string) {
    return this.siteSettingRepository.findOne({
      where: { settingKey: key },
    });
  }

  async updateSiteSetting(key: string, value: string) {
    const setting = await this.siteSettingRepository.findOne({
      where: { settingKey: key },
    });
    if (!setting) throw new NotFoundException(`Setting '${key}' not found`);
    setting.settingValue = value;
    return this.siteSettingRepository.save(setting);
  }

  async bulkUpdateSiteSettings(updates: UpdateSiteSettingDto[]) {
    const results: SiteSetting[] = [];
    for (const update of updates) {
      const setting = await this.siteSettingRepository.findOne({
        where: { settingKey: update.settingKey },
      });
      if (setting) {
        setting.settingValue = update.settingValue;
        results.push(await this.siteSettingRepository.save(setting));
      }
    }
    return results;
  }

  async getPublicSiteSettings() {
    const settings = await this.siteSettingRepository.find();
    const map: Record<string, string> = {};
    for (const s of settings) {
      map[s.settingKey] = s.settingValue || '';
    }
    return map;
  }
}
