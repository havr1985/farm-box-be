import { FileEntityType } from '@modules/files/constants/file-enums';

export enum FileKind {
  AVATAR = 'avatar',
  IMAGE = 'image',
  LOGO = 'logo',
  PHOTO = 'photo',
}

export const VALID_FILE_KINDS: Record<FileEntityType, FileKind[]> = {
  [FileEntityType.USER]: [FileKind.AVATAR],
  [FileEntityType.PRODUCT]: [FileKind.IMAGE],
  [FileEntityType.FARM]: [FileKind.LOGO, FileKind.PHOTO],
};
