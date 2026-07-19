'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    if (email && password) {
      setErrorMessage(null);
      setIsLoading(true);
      try {
        await login(email, password);
        router.push('/dashboard');
      } catch (error: any) {
        setErrorMessage(error?.message || 'Login failed. Please check your credentials.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      handleLogin();
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_10%_20%,rgba(59,130,246,0.16),transparent_35%),radial-gradient(circle_at_90%_80%,rgba(232,121,249,0.14),transparent_40%),linear-gradient(135deg,_#f8fbff_0%,_#eef4ff_45%,_#fdf2ff_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.45),transparent_60%)]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-white/80 bg-white/80 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.28)] backdrop-blur-2xl lg:flex-row"
      >
        <div className="relative flex flex-1 flex-col justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-blue-900 to-fuchsia-800 p-8 text-white sm:p-10 lg:p-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.14),transparent_35%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.08),transparent_60%)]" />
          <div className="relative mx-auto flex w-full max-w-sm flex-col items-center text-center lg:items-start lg:text-left">
            <div className="rounded-[2rem] border border-white/40 bg-white p-6 shadow-[0_20px_70px_-36px_rgba(15,23,42,0.16)]">
              <motion.img
                src="/LOGO.png"
                alt="Draftly logo"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
                className="h-auto w-[50%] min-w-[120px] max-w-[180px] object-contain"
              />
            </div>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Welcome to Draftly
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-200/90">
              Create, edit, and share polished documents in one secure workspace designed for modern teams.
            </p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center bg-slate-50/95 p-5 sm:p-7 lg:p-8">
          <div className="w-full max-w-sm">
            <Card className="overflow-hidden rounded-[1.5rem] border border-slate-200/75 bg-white/95 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.22)]">
              <CardHeader className="px-6 pb-2 pt-8 text-center sm:px-8">
                <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900">
                  Sign in to your account
                </CardTitle>
                <CardDescription className="mx-auto mt-2 max-w-xs text-sm text-slate-500">
                  Access your documents and continue working with confidence.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5 px-6 pb-8 sm:px-8">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Email Address</label>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50 text-base text-slate-800 shadow-inner shadow-slate-200/60 placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50 text-base text-slate-800 shadow-inner shadow-slate-200/60 placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                {errorMessage ? (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-xs font-medium text-red-600"
                  >
                    {errorMessage}
                  </motion.div>
                ) : null}

                <motion.div whileTap={{ scale: 0.99 }}>
                  <Button
                    onClick={handleLogin}
                    className="h-12 w-full rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-violet-500 font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:opacity-95 hover:shadow-xl"
                    disabled={!email || !password || isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </motion.div>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-[10px] font-semibold tracking-[0.25em] text-slate-400">or</span>
                  </div>
                </div>

                <motion.div whileTap={{ scale: 0.99 }}>
                  <Link
                    href="/signup"
                    className="inline-flex h-12 w-full items-center justify-center rounded-2xl border-0 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:brightness-110 hover:shadow-xl"
                  >
                    Create an account
                  </Link>
                </motion.div>

                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3">
                  <label className="flex items-start gap-3 text-left text-xs leading-5 text-slate-500">
                    <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <span>
                      I agree to the{' '}
                      <Link href="/terms" className="font-semibold text-blue-600 underline-offset-2 hover:underline">
                        Terms & Conditions
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="font-semibold text-blue-600 underline-offset-2 hover:underline">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
