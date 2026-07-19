import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const MAX_SIGNUPS_PER_HOUR = 5;
const RATE_LIMIT_WINDOW_MINUTES = 60;
const DEFAULT_SITE_URL = 'https://draftly.honeybhai0990.workers.dev';

function getClientIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIp) {
    return realIp;
  }
  return 'unknown';
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim();
    const password = String(body.password || '').trim();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    if (!email.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    const ip = getClientIp(request);
    const supabase = await createClient();
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString();

    const { error: countError, count } = await supabase
      .from('signup_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('ip', ip)
      .gte('created_at', windowStart);

    if (countError) {
      return NextResponse.json({ error: 'Unable to check signup limits.' }, { status: 500 });
    }

    if ((count ?? 0) >= MAX_SIGNUPS_PER_HOUR) {
      return NextResponse.json(
        { error: `Signup limit exceeded. Please try again in ${RATE_LIMIT_WINDOW_MINUTES} minutes.` },
        { status: 429 },
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL;
    const { error: signupError } = await supabase.auth.signUp(
      { email, password },
      { emailRedirectTo: `${siteUrl}/auth/callback` },
    );

    await supabase.from('signup_attempts').insert({ email, ip });

    if (signupError) {
      const message = signupError.message || 'Unable to sign up. Please try again.';
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Unexpected server error.' }, { status: 500 });
  }
}
