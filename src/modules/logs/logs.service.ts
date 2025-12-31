import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { BaseService } from '../../common/base/base.service';
import { Log } from './entities/log.entity';
import { LoginLog } from './entities/login-log.entity';
import { LogQueryDto, LoginLogQueryDto } from './dto/log.dto';
import { PaginationUtil } from '../../common/utils/pagination.util';

@Injectable()
export class LogsService extends BaseService<Log> {
  constructor(
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
    @InjectRepository(LoginLog)
    private readonly loginLogRepository: Repository<LoginLog>,
  ) {
    super(logRepository);
  }

  async findAllActivityLogs(query: LogQueryDto) {
    const { skip, take } = PaginationUtil.getSkipTake(query.page, query.limit);
    const where: any = {};

    if (query.userId) where.userId = query.userId;
    if (query.module) where.module = query.module;
    if (query.action) where.action = query.action;

    if (query.fromDate && query.toDate) {
      where.createdAt = Between(
        new Date(query.fromDate),
        new Date(query.toDate),
      );
    } else if (query.fromDate) {
      where.createdAt = MoreThanOrEqual(new Date(query.fromDate));
    } else if (query.toDate) {
      where.createdAt = LessThanOrEqual(new Date(query.toDate));
    }

    const [items, total] = await this.logRepository.findAndCount({
      where,
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip,
      take,
    });

    return { items, total };
  }

  async createActivityLog(data: any) {
    const log = this.logRepository.create(data);
    return this.logRepository.save(log);
  }

  async createLoginLog(userId: string, ipAddress: string) {
    const log = this.loginLogRepository.create({ userId, ipAddress });
    return this.loginLogRepository.save(log);
  }

  async findAllLoginLogs(query: LoginLogQueryDto) {
    const { skip, take } = PaginationUtil.getSkipTake(query.page, query.limit);
    const where: any = {};

    if (query.userId) where.userId = query.userId;

    if (query.fromDate && query.toDate) {
      where.createdAt = Between(
        new Date(query.fromDate),
        new Date(query.toDate),
      );
    } else if (query.fromDate) {
      where.createdAt = MoreThanOrEqual(new Date(query.fromDate));
    } else if (query.toDate) {
      where.createdAt = LessThanOrEqual(new Date(query.toDate));
    }

    const [items, total] = await this.loginLogRepository.findAndCount({
      where,
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip,
      take,
    });

    return { items, total };
  }
}
