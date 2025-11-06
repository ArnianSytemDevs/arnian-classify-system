import type { ReactNode } from 'react'
import { rolePermissions } from '../helpers/Premissions';

interface UserPermissionsProops {
    role: string | string[] | null | undefined;
    permission: string;
    children: ReactNode;
  }

export default function UserPermissions({ permission, role, children }:UserPermissionsProops) {
  if (!role) return null;

  const roles = Array.isArray(role) ? role : [role]; // Siempre tratarlo como array

  const hasAccess = roles.some((r) => {
    const permissions = rolePermissions[r as keyof typeof rolePermissions] || [];
    return permissions.includes(permission);
  });

  if (hasAccess) {
    return <>{children}</>;
  }

  return null;
}
