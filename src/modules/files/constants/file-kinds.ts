import { FileEntityType } from '@modules/files/constants/file-enums';

export enum FileKind {
  AVATAR = 'avatar',
  IMAGE = 'image',
  LOGO = 'logo',
  PHOTO = 'photo',
}

type FileKindMap = {
  [FileEntityType.USER]: FileKind.AVATAR;
  [FileEntityType.PRODUCT]: FileKind.IMAGE;
  [FileEntityType.FARM]: FileKind.LOGO | FileKind.PHOTO;
};

type KeyPrefixMap = {
  [E in FileEntityType]: Record<FileKindMap[E], string>;
};

export const KEY_PREFIX: KeyPrefixMap = {
  [FileEntityType.USER]: {
    [FileKind.AVATAR]: 'users/{entityId}/avatar',
  },
  [FileEntityType.PRODUCT]: {
    [FileKind.IMAGE]: 'products/{entityId}/images',
  },
  [FileEntityType.FARM]: {
    [FileKind.LOGO]: 'farms/{entityId}/logo',
    [FileKind.PHOTO]: 'farms/{entityId}/photos',
  },
};
