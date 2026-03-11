import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileRecord } from '@modules/files/entities/file-record.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FilesRepository {
  constructor(
    @InjectRepository(FileRecord)
    private readonly filesRepository: Repository<FileRecord>,
  ) {}

  async create(data: Partial<FileRecord>): Promise<FileRecord> {
    const file = this.filesRepository.create(data);
    return this.filesRepository.save(file);
  }

  async findById(id: string): Promise<FileRecord | null> {
    return this.filesRepository.findOne({ where: { id } });
  }

  async save(file: FileRecord): Promise<FileRecord> {
    return this.filesRepository.save(file);
  }

  async softRemove(file: FileRecord): Promise<void> {
    await this.filesRepository.softRemove(file);
  }
}
