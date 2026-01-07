import {
  Repository,
  DeepPartial,
  FindOneOptions,
  FindManyOptions,
  SelectQueryBuilder,
  Brackets,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { BaseQueryDto } from '../dto/base-query.dto';
import { PaginationUtil } from '../utils/pagination.util';

export abstract class BaseService<T extends BaseEntity> {
  protected searchableFields: string[] = [];

  constructor(protected readonly repository: Repository<T>) {}

  protected getQueryBuilder(alias: string = 'entity'): SelectQueryBuilder<T> {
    return this.repository.createQueryBuilder(alias);
  }

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return await this.repository.save(entity);
  }

  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return await this.repository.find(options);
  }

  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    return await this.repository.findOne(options);
  }

  async findPaginated(
    query: BaseQueryDto,
    alias: string = 'entity',
    extraFilters?: (qb: SelectQueryBuilder<T>) => void,
  ): Promise<{ items: T[]; total: number }> {
    const { page, limit, search, sortBy, order } = query;
    const { skip, take } = PaginationUtil.getSkipTake(page, limit);

    const qb = this.getQueryBuilder(alias);

    if (search && this.searchableFields.length > 0) {
      qb.andWhere(
        new Brackets((hb) => {
          this.searchableFields.forEach((field, index) => {
            if (index === 0) {
              hb.where(`${alias}.${field} ILIKE :search`, {
                search: `%${search}%`,
              });
            } else {
              hb.orWhere(`${alias}.${field} ILIKE :search`, {
                search: `%${search}%`,
              });
            }
          });
        }),
      );
    }

    if (extraFilters) {
      extraFilters(qb);
    }

    qb.skip(skip)
      .take(take)
      .orderBy(`${alias}.${sortBy || 'createdAt'}`, order || 'DESC');

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  async update(id: string, data: DeepPartial<T>): Promise<T | null> {
    const exists = await this.findOne({ where: { id } as any });
    if (!exists) return null;
    await this.repository.update(id, data as any);
    return this.findOne({ where: { id } as any });
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.repository.softDelete(id);
    return !!result.affected;
  }

  async restore(id: string): Promise<boolean> {
    const result = await this.repository.restore(id);
    return !!result.affected;
  }
}
