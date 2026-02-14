import { Injectable } from '@nestjs/common';
import { UsersRepository } from '@modules/users/users.repository';
import { User } from '@modules/users/entities/user.entity';
import { NotFoundException } from '@common/exceptions/app.exception';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

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
}
