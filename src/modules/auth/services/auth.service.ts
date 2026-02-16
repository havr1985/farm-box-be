import { Injectable } from '@nestjs/common';
import { TokenService } from '@modules/auth/services/token.service';
import { UsersService } from '@modules/users/users.service';
import { RegisterDto } from '@modules/auth/dto/register.dto';
import { AuthResponseDto } from '@modules/auth/dto/auth-response.dto';
import {
  ConflictException,
  UnauthorizedException,
} from '@common/exceptions/app.exception';
import * as argon2 from 'argon2';
import { User } from '@modules/users/entities/user.entity';
import { LoginDto } from '@modules/auth/dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly usersService: UsersService,
  ) {}

  async register(
    registerDto: RegisterDto,
    userAgent?: string,
    ip?: string,
  ): Promise<{ auth: AuthResponseDto; refreshToken: string }> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException(
        `User with email ${registerDto.email} already exists`,
      );
    }
    const passwordHash = await argon2.hash(registerDto.password);

    const user = await this.usersService.create({
      name: registerDto.name,
      email: registerDto.email,
      passwordHash,
      phone: registerDto.phone ?? null,
    });
    return this.generateAuthResponse(user, userAgent, ip);
  }

  async login(
    loginDto: LoginDto,
    userAgent?: string,
    ip?: string,
  ): Promise<{ auth: AuthResponseDto; refreshToken: string }> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      await argon2.hash('dummy-password');
      throw new UnauthorizedException('Invalid email or password');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('User account is deactivated');
    }
    const isPasswordValid = await argon2.verify(
      user.passwordHash,
      loginDto.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.generateAuthResponse(user, userAgent, ip);
  }

  async refresh(
    plainToken: string,
    userAgent?: string,
    ip?: string,
  ): Promise<{ auth: AuthResponseDto; refreshToken: string }> {
    const { accessToken, refreshToken, user } =
      await this.tokenService.rotateRefreshToken(plainToken, userAgent, ip);
    return {
      auth: {
        accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          roles: user.roles,
        },
      },
      refreshToken,
    };
  }

  async logout(plainToken: string): Promise<void> {
    await this.tokenService.revokeToken(plainToken);
  }

  async logoutAll(userId: string): Promise<void> {
    await this.tokenService.revokedAll(userId);
  }

  private async generateAuthResponse(
    user: User,
    userAgent?: string,
    ip?: string,
  ): Promise<{ auth: AuthResponseDto; refreshToken: string }> {
    const accessToken = this.tokenService.generateAccessToken(user);
    const refreshToken = await this.tokenService.generateRefreshToken(
      user,
      userAgent,
      ip,
    );
    return {
      auth: {
        accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          roles: user.roles,
        },
      },
      refreshToken,
    };
  }
}
