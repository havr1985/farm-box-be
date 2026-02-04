import { Module } from '@nestjs/common';
import { FarmsService } from './farms.service';
import { FarmsController } from './farms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Farm } from '@modules/farms/entities/farm.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Farm])],
  providers: [FarmsService],
  controllers: [FarmsController],
})
export class FarmsModule {}
