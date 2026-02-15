import { UserRole } from '@modules/users/entities/user.entity';

export const PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.CUSTOMER]: [
    // Products
    'products:read',

    // Orders - свої
    'orders:create',
    'orders:read:own',
    'orders:cancel:own',

    // Payments - свої
    'payments:create:own',
    'payments:read:own',

    // Farms - публічна інфа
    'farms:read',

    // Users - свій профіль
    'users:read:own',
    'users:update:own',

    // Farmer application
    'farmer-applications:create',
    'farmer-applications:read:own',
  ],

  [UserRole.FARMER]: [
    // Products - своєї ферми
    'products:read',
    'products:create:own',
    'products:update:own',
    'products:delete:own',

    // Orders - замовлення з продуктами своєї ферми
    'orders:read:farm',
    'orders:update-status:farm',

    // Farms - своя
    'farms:read',
    'farms:update:own',

    // Users
    'users:read:own',
    'users:update:own',

    // Payments - виплати своєї ферми
    'payments:read:farm',
  ],

  [UserRole.ADMIN]: [
    // Users
    'users:read:any',
    'users:update:any',
    'users:deactivate:any',

    // Farms
    'farms:read',
    'farms:create',
    'farms:update:any',
    'farms:deactivate:any',

    // Products
    'products:read',
    'products:update:any',
    'products:deactivate:any',

    // Orders - аналітика, без refund
    'orders:read:any',

    // Categories
    'categories:create',
    'categories:update',
    'categories:delete',

    // Farmer applications
    'farmer-applications:read:any',
    'farmer-applications:approve',
    'farmer-applications:reject',
  ],

  [UserRole.SUPPORT]: [
    // Orders - read + cancel від імені клієнта
    'orders:read:any',
    'orders:cancel:any',

    // Payments - read + refund
    'payments:read:any',
    'payments:refund',

    // Users - read only
    'users:read:any',

    // Products, Farms - read
    'products:read',
    'farms:read',
  ],

  [UserRole.PENDING_FARMER]: ['farmer-applications:read:own'],
};

export function getUserPermissions(roles: UserRole[]): string[] {
  const permissionSet = new Set<string>();

  for (const role of roles) {
    const rolePermissions = PERMISSIONS[role] ?? [];
    for (const permission of rolePermissions) {
      permissionSet.add(permission);
    }
  }

  return [...permissionSet];
}
