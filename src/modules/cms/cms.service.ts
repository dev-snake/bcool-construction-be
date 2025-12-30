import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../common/base/base.service';
import { Page } from './entities/page.entity';
import { PageSection } from './entities/page-section.entity';
import { Banner } from './entities/banner.entity';
import { Counter } from './entities/counter.entity';

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
  ) {
    super(pageRepository);
  }

  // Page Sections
  async addSection(pageId: string, data: any) {
    const page = await this.findOne({ where: { id: pageId } as any });
    if (!page) throw new NotFoundException('Page not found');
    const section = this.sectionRepository.create({ ...data, pageId });
    return this.sectionRepository.save(section);
  }

  async updateSection(id: string, data: any) {
    await this.sectionRepository.update(id, data);
    return this.sectionRepository.findOne({ where: { id } as any });
  }

  async removeSection(id: string) {
    await this.sectionRepository.delete(id);
  }

  // Banners
  async findAllBanners() {
    return this.bannerRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }

  async createBanner(data: any) {
    const banner = this.bannerRepository.create(data);
    return this.bannerRepository.save(banner);
  }

  // Counters
  async findAllCounters() {
    return this.counterRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }

  async createCounter(data: any) {
    const counter = this.counterRepository.create(data);
    return this.counterRepository.save(counter);
  }

  // Aggregate Home Data
  async getHomeData() {
    const [banners, counters] = await Promise.all([
      this.findAllBanners(),
      this.findAllCounters(),
    ]);

    // About page short intro (slug could be 'home-intro' or part of 'home' page)
    const homePage = await this.pageRepository.findOne({
      where: { slug: 'home' },
      relations: ['sections'],
    });

    return {
      banners,
      counters,
      intro: homePage?.sections.find((s) => s.isVisible) || null,
      sections: homePage?.sections || [],
    };
  }
}
