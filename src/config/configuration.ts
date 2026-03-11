import { registerAs } from '@nestjs/config';
import { StringValue } from 'ms';

export const appConfig = registerAs('app', () => ({
  port: process.env.APP_PORT ? parseInt(process.env.APP_PORT, 10) : 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  globalPrefix: 'api',
  apiVersion: '1',
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

export const s3Config = registerAs('s3', () => ({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  bucket: process.env.AWS_S3_BUCKET || '',
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.AWS_S3_ENDPOINT,
  cloudfrontBaseUrl: process.env.CLOUDFRONT_BASE_URL,
  defaultPresignTtl: process.env.FILES_PRESIGN_EXPIRES_IN_SEC
    ? Number(process.env.FILES_PRESIGN_EXPIRES_IN_SEC)
    : 900,
}));

export const configs = [appConfig, dbConfig, loggerConfig, jwtConfig, s3Config];

export type AppConfig = ReturnType<typeof appConfig>;
export type DbConfig = ReturnType<typeof dbConfig>;
export type JwtConfig = ReturnType<typeof jwtConfig>;
export type S3Config = ReturnType<typeof s3Config>;
