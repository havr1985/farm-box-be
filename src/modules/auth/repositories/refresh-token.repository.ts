import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from '@modules/auth/entities/token.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    return this.refreshTokenRepository.findOne({
      where: { tokenHash },
      relations: ['user'],
    });
  }

  async save(data: Partial<RefreshToken>): Promise<RefreshToken> {
    return this.refreshTokenRepository.save(data);
  }

  async revokeByTokenHash(tokenHash: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { tokenHash },
      { isRevoked: true },
    );
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true },
    );
  }
}
