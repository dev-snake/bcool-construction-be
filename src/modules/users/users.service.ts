import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { BaseService } from '../../common/base/base.service';
import { PaginationUtil } from '../../common/utils/pagination.util';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { CryptoUtil } from '../../common/utils/crypto.util';
import {
  CreateUserDto,
  UpdateUserDto,
  UserQueryDto,
} from './dto/create-user.dto';

@Injectable()
export class UsersService extends BaseService<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
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

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id } as any,
      relations: ['roles'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findUsersPaginated(query: UserQueryDto) {
    const { search, roleId, isActive } = query;
    const { skip, take } = PaginationUtil.getSkipTake(query.page, query.limit);

    const qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles');

    if (search) {
      qb.andWhere(
        '(user.email LIKE :search OR user.fullName LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (roleId) {
      qb.andWhere('roles.id = :roleId', { roleId });
    }

    if (isActive !== undefined) {
      qb.andWhere('user.isActive = :isActive', { isActive });
    }

    qb.orderBy('user.createdAt', 'DESC')
      .take(take)
      .skip(skip);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      meta: {
        total,
        page: query.page || 1,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async create(data: CreateUserDto): Promise<User> {
    const existing = await this.findByEmail(data.email);
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const user = this.userRepository.create({
      email: data.email,
      fullName: data.fullName,
      phone: data.phone,
      isActive: data.isActive ?? true,
    });

    if (data.password) {
      user.passwordHash = await CryptoUtil.hash(data.password);
    }

    if (data.roleIds && data.roleIds.length > 0) {
      user.roles = await this.roleRepository.findBy({
        id: In(data.roleIds),
      });
    }

    return this.userRepository.save(user);
  }

  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    if (data.email) user.email = data.email;
    if (data.fullName) user.fullName = data.fullName;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.isActive !== undefined) user.isActive = data.isActive;

    if (data.roleIds) {
      user.roles = await this.roleRepository.findBy({
        id: In(data.roleIds),
      });
    }

    if (data.password) {
      user.passwordHash = await CryptoUtil.hash(data.password);
    }

    return this.userRepository.save(user);
  }

  async lock(id: string): Promise<User> {
    const user = await this.findById(id);
    user.isLocked = true;
    return this.userRepository.save(user);
  }

  async unlock(id: string): Promise<User> {
    const user = await this.findById(id);
    user.isLocked = false;
    return this.userRepository.save(user);
  }
}
