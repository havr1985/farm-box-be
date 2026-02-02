import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configs } from '@config/configuration';
import { validate } from '@config/env.validation';
import { DatabaseModule } from '@infrastructure/database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: configs,
      envFilePath: '.env',
      validate,
    }),
    DatabaseModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
