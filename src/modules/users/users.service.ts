import { Injectable } from '@nestjs/common';
import { UsersRepository } from '@modules/users/users.repository';
import { User } from '@modules/users/entities/user.entity';
import { NotFoundException } from '@common/exceptions/app.exception';
import { FilesService } from '@modules/files/files.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly fileService: FilesService,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.findAll();
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOneById(id);
    if (!user) {
      throw new NotFoundException('User', id);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneByEmail(email);
  }

  async create(dto: Partial<User>): Promise<User> {
    return this.usersRepository.createUser(dto);
  }

  async setAvatar(fileId: string, userId: string) {
    const user = await this.findById(userId);
    const file = await this.fileService.getReadyFileForAttach(fileId, user.id);
    await this.fileService.attachToEntity(file, user.id);
    user.avatarFileId = fileId;
    await this.usersRepository.save(user);
    const avatarUrl = await this.fileService.buildFileUrl(file.objectKey);

    return {
      userId: user.id,
      avatarFileId: file.id,
      avatarUrl,
    };
  }
}
