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

  async findByEmail(
    email: string,
    includePassword = false,
  ): Promise<User | null> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('roles.permissions', 'permissions')
      .leftJoinAndSelect('permissions.module', 'module')
      .where('user.email = :email', { email });

    if (includePassword) {
      queryBuilder.addSelect('user.passwordHash');
    }

    return queryBuilder.getOne();
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
