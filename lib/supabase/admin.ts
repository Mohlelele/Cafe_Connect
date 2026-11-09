import 'server-only';

import { createClient } from '@supabase/supabase-js';

// Bypasses every access rule. Only call this after confirming the caller is an admin.
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) return null;

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const hasAdminClient = () => Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
