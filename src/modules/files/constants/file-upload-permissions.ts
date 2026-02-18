import { FileEntityType } from '@modules/files/constants/file-enums';
import { UserRole } from '@modules/users/entities/user.entity';

export const UPLOAD_PERMISSIONS: Record<FileEntityType, UserRole[]> = {
  [FileEntityType.USER]: [
    UserRole.FARMER,
    UserRole.CUSTOMER,
    UserRole.SUPPORT,
    UserRole.ADMIN,
  ],
  [FileEntityType.PRODUCT]: [UserRole.FARMER, UserRole.ADMIN],
  [FileEntityType.FARM]: [UserRole.FARMER, UserRole.ADMIN],
};
