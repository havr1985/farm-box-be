import { registerAs } from '@nestjs/config';
import { StringValue } from 'ms';

export const appConfig = registerAs('app', () => ({
  port: process.env.APP_PORT ? parseInt(process.env.APP_PORT, 10) : 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
}));

export const dbConfig = registerAs('db', () => ({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
}));

export const loggerConfig = registerAs('logger', () => ({
  level: process.env.LOG_LEVEL,
}));

export const jwtConfig = registerAs('jwt', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET,
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  accessExpiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as StringValue,
  refreshExpiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ||
    '15d') as StringValue,
}));

export const configs = [appConfig, dbConfig, loggerConfig, jwtConfig];

export type AppConfig = ReturnType<typeof appConfig>;
export type DbConfig = ReturnType<typeof dbConfig>;
export type JwtConfig = ReturnType<typeof jwtConfig>;
