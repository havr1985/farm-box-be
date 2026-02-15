import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from '@modules/auth/entities/token.entity';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '@modules/users/users.module';
import { TokenService } from '@modules/auth/services/token.service';
import { RefreshTokenRepository } from '@modules/auth/repositories/refresh-token.repository';
import { JwtStrategy } from '@modules/auth/strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken]),
    JwtModule.register({}),
    UsersModule,
  ],
  providers: [AuthService, TokenService, RefreshTokenRepository, JwtStrategy],
  controllers: [AuthController],
  exports: [TokenService],
})
export class AuthModule {}
