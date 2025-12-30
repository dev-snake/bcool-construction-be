import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../common/base/base.service';
import { Log } from './entities/log.entity';
import { LoginLog } from './entities/login-log.entity';

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

  async createActivityLog(data: any) {
    const log = this.logRepository.create(data);
    return this.logRepository.save(log);
  }

  async createLoginLog(userId: string, ipAddress: string) {
    const log = this.loginLogRepository.create({ userId, ipAddress });
    return this.loginLogRepository.save(log);
  }

  async findLoginLogs(userId?: string) {
    return this.loginLogRepository.find({
      where: userId ? { userId } : {},
      order: { loggedAt: 'DESC' },
    });
  }
}
