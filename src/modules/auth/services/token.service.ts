import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtConfig, jwtConfig } from '@config/configuration';
import { RefreshTokenRepository } from '@modules/auth/repositories/refresh-token.repository';
import { User } from '@modules/users/entities/user.entity';
import { AccessTokenPayload } from '@modules/auth/interfaces/jwt-payload.interface';
import { createHash, randomBytes } from 'node:crypto';
import { UnauthorizedException } from '@common/exceptions/app.exception';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY) private readonly jwt: JwtConfig,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  generateAccessToken(user: User): string {
    const payload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };
    return this.jwtService.sign(
      { ...payload },
      {
        secret: this.jwt.accessSecret,
        expiresIn: this.jwt.accessExpiresIn,
      },
    );
  }

  async generateRefreshToken(
    user: User,
    userAgent?: string,
    ip?: string,
  ): Promise<string> {
    const plainToken = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(plainToken);
    const expiresAt = this.calculateExpiry(this.jwt.refreshExpiresIn);
    const data = {
      userId: user.id,
      tokenHash,
      expiresAt,
      userAgent: userAgent ?? null,
      ip: ip ?? null,
    };
    await this.refreshTokenRepository.save(data);
    return plainToken;
  }

  async rotateRefreshToken(
    plainToken: string,
    userAgent?: string,
    ip?: string,
  ): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const tokenHash = this.hashToken(plainToken);

    const existingToken =
      await this.refreshTokenRepository.findByTokenHash(tokenHash);
    if (!existingToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (existingToken.isRevoked) {
      await this.revokedAll(existingToken.userId);
      throw new UnauthorizedException(
        'Refresh token reuse detected. All sessions are revoked',
      );
    }
    if (existingToken.isExpired) {
      throw new UnauthorizedException('Refresh token expired');
    }
    if (!existingToken.user.isActive) {
      await this.revokedAll(existingToken.userId);
      throw new UnauthorizedException('User account is deactivated');
    }

    const newPlainToken = randomBytes(32).toString('hex');
    const newTokenHash = this.hashToken(newPlainToken);
    const expiresAt = this.calculateExpiry(this.jwt.refreshExpiresIn);

    const data = {
      userId: existingToken.userId,
      tokenHash: newTokenHash,
      expiresAt,
      userAgent: userAgent ?? null,
      ip: ip ?? null,
    };

    const newToken = await this.refreshTokenRepository.save(data);
    existingToken.isRevoked = true;
    existingToken.replacedByTokenId = newToken.id;
    await this.refreshTokenRepository.save(existingToken);

    const accessToken = this.generateAccessToken(existingToken.user);
    return {
      accessToken,
      refreshToken: newPlainToken,
      user: existingToken.user,
    };
  }

  async revokeToken(plainToken: string): Promise<void> {
    const tokenHash = this.hashToken(plainToken);
    await this.refreshTokenRepository.revokeByTokenHash(tokenHash);
  }

  async revokedAll(userId: string): Promise<void> {
    await this.refreshTokenRepository.revokeAllByUserId(userId);
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private calculateExpiry(expiresIn: string): Date {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error(`Invalid expiresIn format: ${expiresIn}`);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];
    const now = new Date();

    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return new Date(now.getTime() + value * multipliers[unit]);
  }
}
