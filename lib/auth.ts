import type { User } from '@supabase/supabase-js';
import { createSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase/server';

// Read-only auth helpers for Server Components / Route Handlers.
// (Keep these out of auth-actions.ts, which is a 'use server' actions module.)

export async function getCurrentUser(): Promise<User | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}

function adminEmailAllowlist(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

// A user is an admin if their secure app_metadata.role is "admin"
// (set via the Supabase dashboard / admin API) OR their email is in the
// ADMIN_EMAILS allowlist env var (comma-separated). Both are server-side only.
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const role = (user.app_metadata as { role?: string } | undefined)?.role;
  if (role === 'admin') return true;

  const email = user.email?.toLowerCase();
  return Boolean(email && adminEmailAllowlist().includes(email));
}
