import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { FilesRepository } from '@modules/files/files.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileRecord } from '@modules/files/entities/file-record.entity';
import { StorageModule } from '@infrastructure/storage/storage.module';

@Module({
  imports: [TypeOrmModule.forFeature([FileRecord]), StorageModule],
  providers: [FilesService, FilesRepository],
  controllers: [FilesController],
  exports: [FilesService],
})
export class FilesModule {}
