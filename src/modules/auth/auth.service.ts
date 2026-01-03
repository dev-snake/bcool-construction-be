import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { CryptoUtil } from '../../common/utils/crypto.util';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AUTH_CONFIG } from '../../common/constants/system.constant';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await this.usersService.findByEmail(email, true);
    if (!user || !(await CryptoUtil.compare(pass, user.passwordHash))) {
      return null;
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản chưa được kích hoạt');
    }

    if (user.isLocked) {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    const { passwordHash: _hash, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create(registerDto);
    return this.generateTokens(user);
  }

  private generateTokens(user: User | Omit<User, 'passwordHash'>) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, {
        expiresIn: AUTH_CONFIG.REFRESH_TOKEN_EXPIRES,
      }),
      user,
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken);
      const user = await this.usersService.findOne({
        where: { id: payload.sub },
      });
      if (!user) {
        throw new UnauthorizedException();
      }

      if (!user.isActive || user.isLocked) {
        throw new UnauthorizedException('Tài khoản không khả dụng');
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.usersService.findOne({
      where: { id: userId },
      select: ['id', 'passwordHash'],
    } as any);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isMatch = await CryptoUtil.compare(
      changePasswordDto.oldPassword,
      user.passwordHash,
    );
    if (!isMatch) {
      throw new BadRequestException('Old password does not match');
    }

    const passwordHash = await CryptoUtil.hash(changePasswordDto.newPassword);
    await this.usersService.update(userId, { passwordHash } as any);

    return { message: 'Password changed successfully' };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    return this.usersService.update(userId, updateProfileDto);
  }
}
