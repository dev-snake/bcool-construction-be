import {
  Repository,
  DeepPartial,
  FindOneOptions,
  FindManyOptions,
} from 'typeorm';
import { BaseEntity } from './base.entity';

export abstract class BaseService<T extends BaseEntity> {
  constructor(protected readonly repository: Repository<T>) {}

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

  async findPaginated(options: FindManyOptions<T>): Promise<[T[], number]> {
    return await this.repository.findAndCount(options);
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
