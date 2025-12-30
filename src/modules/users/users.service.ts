import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../common/base/base.service';
import { User } from './entities/user.entity';
import { CryptoUtil } from '../../common/utils/crypto.util';

@Injectable()
export class UsersService extends BaseService<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super(userRepository);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions', 'roles.permissions.module'],
    });
  }

  async create(data: any): Promise<User> {
    const existing = await this.findByEmail(data.email);
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    if (data.password) {
      data.passwordHash = await CryptoUtil.hash(data.password);
      delete data.password;
    }

    return super.create(data);
  }
}
