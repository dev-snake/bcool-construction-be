import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Between,
  LessThanOrEqual,
  MoreThanOrEqual,
  SelectQueryBuilder,
} from 'typeorm';
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

  protected getQueryBuilder(alias: string = 'log'): SelectQueryBuilder<Log> {
    return this.logRepository
      .createQueryBuilder(alias)
      .leftJoinAndSelect(`${alias}.user`, 'user');
  }

  async findAllActivityLogs(query: LogQueryDto) {
    return this.findPaginated(query, 'log', (qb) => {
      if (query.userId) qb.andWhere('log.userId = :userId', { userId: query.userId });
      if (query.module) qb.andWhere('log.module = :module', { module: query.module });
      if (query.action) qb.andWhere('log.action = :action', { action: query.action });

      if (query.fromDate && query.toDate) {
        qb.andWhere('log.createdAt BETWEEN :fromDate AND :toDate', {
          fromDate: query.fromDate,
          toDate: query.toDate,
        });
      } else if (query.fromDate) {
        qb.andWhere('log.createdAt >= :fromDate', { fromDate: query.fromDate });
      } else if (query.toDate) {
        qb.andWhere('log.createdAt <= :toDate', { toDate: query.toDate });
      }
    });
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
    const qb = this.loginLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user');

    if (query.userId)
      qb.andWhere('log.userId = :userId', { userId: query.userId });

    if (query.fromDate && query.toDate) {
      qb.andWhere('log.createdAt BETWEEN :fromDate AND :toDate', {
        fromDate: query.fromDate,
        toDate: query.toDate,
      });
    } else if (query.fromDate) {
      qb.andWhere('log.createdAt >= :fromDate', { fromDate: query.fromDate });
    } else if (query.toDate) {
      qb.andWhere('log.createdAt <= :toDate', { toDate: query.toDate });
    }

    qb.orderBy('log.createdAt', 'DESC').skip(skip).take(take);

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }
}
