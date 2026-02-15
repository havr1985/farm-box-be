import { UserRole } from '@modules/users/entities/user.entity';
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = Symbol('roles');
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
