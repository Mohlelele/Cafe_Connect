import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Only same-site paths, so a crafted email link cannot redirect somewhere else.
const safePath = (next: string | null) => (
  next && next.startsWith('/') && !next.startsWith('//') && !next.includes('\\') ? next : '/'
);

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(safePath(searchParams.get('next')), origin));
  }

  return NextResponse.redirect(new URL('/login?error=link', origin));
}
