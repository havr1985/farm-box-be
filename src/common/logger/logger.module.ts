import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { CORRELATION_ID_HEADER } from '@common/middleware/correlation-id.middleware';
import { Request } from 'express';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProd =
          configService.get<string>('app.nodeEnv') === 'production';
        return {
          pinoHttp: {
            genReqId: (req: Request) =>
              req.headers[CORRELATION_ID_HEADER] as string,
            level: configService.get('logger.level', 'info'),
            transport: isProd
              ? undefined
              : {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    singleLine: true,
                    translateTime: 'HH:MM:ss',
                    ignore: 'pid, hostname',
                  },
                },
            serializers: {
              req: (req: Request) => ({
                method: req.method,
                url: req.url,
              }),
              res: (res: Response) => ({
                status: res.status,
              }),
            },
            autoLogging: true,
            quietReqLogger: true,
          },
        };
      },
    }),
  ],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}
