import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from '@modules/auth/services/auth.service';
import { JwtConfig, jwtConfig } from '@config/configuration';
import { RegisterDto } from '@modules/auth/dto/register.dto';
import { Request, Response } from 'express';
import { AuthResponseDto } from '@modules/auth/dto/auth-response.dto';
import { LoginDto } from '@modules/auth/dto/login.dto';
import { UnauthorizedException } from '@common/exceptions/app.exception';
import { Public } from '@modules/auth/decorators/public.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

const REFRESH_COOKIE_NAME = 'refresh_token';
const REFRESH_COOKIE_PATH = '/api/auth/refresh';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly refreshCookieMaxAge: number;
  constructor(
    private readonly authService: AuthService,
    @Inject(jwtConfig.KEY) private readonly jwt: JwtConfig,
  ) {
    this.refreshCookieMaxAge = this.parseToMs(this.jwt.refreshExpiresIn);
  }
  @Public()
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'User registered',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const { auth, refreshToken } = await this.authService.register(
      registerDto,
      req.headers['user-agent'],
      req.ip,
    );
    this.setRefreshCookie(res, refreshToken);
    return auth;
  }

  @Public()
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const { auth, refreshToken } = await this.authService.login(
      loginDto,
      req.headers['user-agent'],
      req.ip,
    );
    this.setRefreshCookie(res, refreshToken);
    return auth;
  }

  @ApiOperation({ summary: 'Refresh access token using httpOnly cookie' })
  @ApiCookieAuth('refresh_token')
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const oldToken = this.getRefreshToken(req);

    const { auth, refreshToken } = await this.authService.refresh(
      oldToken,
      req.headers['user-agent'],
      req.ip,
    );
    this.setRefreshCookie(res, refreshToken);
    return auth;
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const token = this.getRefreshToken(req);
    await this.authService.logout(token);
    this.clearRefreshCookie(res);
    return { message: 'Logged out successfully' };
  }

  private getRefreshToken(req: Request): string {
    const token = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    if (!token) {
      throw new UnauthorizedException('Refresh token not found');
    }
    return token;
  }

  private setRefreshCookie(res: Response, token: string): void {
    res.cookie(REFRESH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: REFRESH_COOKIE_PATH,
      maxAge: this.refreshCookieMaxAge,
    });
  }

  private clearRefreshCookie(res: Response): void {
    res.clearCookie(REFRESH_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: REFRESH_COOKIE_PATH,
    });
  }

  private parseToMs(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) throw new Error(`Invalid expiresIn: ${expiresIn}`);

    const value = parseInt(match[1], 10);
    const multipliers: Record<string, number> = {
      s: 1_000,
      m: 60_000,
      h: 3_600_000,
      d: 86_400_000,
    };

    return value * multipliers[match[2]];
  }
}
