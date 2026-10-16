import type { AppView, User } from '../../types';
import { UserRole } from '../../types';

type SupabaseUserLike = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
  app_metadata?: Record<string, unknown> | null;
};

const VALID_USER_ROLES = new Set<string>(Object.values(UserRole));

/**
 * Resolve only trusted authorization metadata.
 *
 * Roles must be provisioned server-side in app_metadata (or by a server-side
 * profile/RPC in a future revision). user_metadata is user-editable and must
 * never grant privileges.
 */
export function resolveUserRole(supabaseUser: SupabaseUserLike): UserRole {
  const appMetaRole = supabaseUser.app_metadata?.role;
  if (typeof appMetaRole === 'string' && VALID_USER_ROLES.has(appMetaRole)) {
    return appMetaRole as UserRole;
  }

  return UserRole.MEMBER;
}

export function mapSupabaseUserToAppUser(supabaseUser: SupabaseUserLike): User {
  const meta = supabaseUser.user_metadata || {};
  const appMeta = supabaseUser.app_metadata || {};
  const role = resolveUserRole(supabaseUser);
  const name = (meta.name as string) || supabaseUser.email?.split('@')[0] || 'User';

  return {
    id: supabaseUser.id,
    name,
    role,
    avatar: (meta.avatar_url as string) || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=6366f1&color=fff`,
    churchId: appMeta.church_id as string || undefined,
  };
}

export function getDefaultViewForUserRole(role: UserRole): AppView {
  if (role === UserRole.MEMBER) return 'MY_PORTAL';
  if (role === UserRole.SUPER_ADMIN) return 'PLATFORM_DASHBOARD';
  return 'DASHBOARD';
}
