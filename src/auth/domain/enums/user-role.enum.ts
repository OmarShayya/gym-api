export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff',
  MEMBER = 'member',
}

export const RoleHierarchy = {
  [UserRole.ADMIN]: 3,
  [UserRole.STAFF]: 2,
  [UserRole.MEMBER]: 1,
};

export function hasPermission(
  userRole: UserRole,
  requiredRole: UserRole,
): boolean {
  return RoleHierarchy[userRole] >= RoleHierarchy[requiredRole];
}
