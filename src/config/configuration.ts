import { registerAs } from '@nestjs/config';

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

export const configs = [appConfig, dbConfig, loggerConfig];

export type AppConfig = ReturnType<typeof appConfig>;
export type DbConfig = ReturnType<typeof dbConfig>;
