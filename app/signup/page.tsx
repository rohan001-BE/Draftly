'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignup = async () => {
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      await signup(email, password);
      router.push('/auth/verify-sent');
    } catch (error: any) {
      setErrorMessage(error?.message || 'Sign up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      handleSignup();
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden"
      style={{
        backgroundImage: 'radial-gradient(circle at top right, rgba(56, 189, 248, 0.14), transparent 28%), radial-gradient(circle at bottom left, rgba(234, 179, 8, 0.1), transparent 22%), linear-gradient(180deg, var(--background), hsl(212, 50%, 92%))',
      }}
    >
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-accent/10 rounded-full blur-[90px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md z-10"
      >
        <Card className="border border-white/20 dark:border-zinc-800/30 bg-white/70 dark:bg-zinc-950/70 shadow-[0_32px_64px_-16px_rgba(15,23,42,0.15)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] backdrop-blur-2xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="text-center pt-10 pb-6 px-8">
            <div className="flex justify-center mb-5">
              <motion.div
                whileHover={{ scale: 1.08, rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.3 }}
                className="flex h-18 w-18 items-center justify-center rounded-[1.75rem] bg-gradient-to-tr from-secondary via-primary to-accent shadow-xl shadow-secondary/20 p-0.5"
              >
                <div className="w-full h-full bg-white dark:bg-zinc-950 rounded-[1.65rem] flex items-center justify-center">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
              </motion.div>
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight text-foreground bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text">
              Create an account
            </CardTitle>
            <CardDescription className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
              Sign up below to start collaborating on secure documents in real time.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 px-8 pb-10">
            {/* Email Input */}
            <div className="space-y-5">
              <label className="block mb-2 text-xs uppercase tracking-wider font-semibold text-muted-foreground">Email Address</label>
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyPress}
                className="rounded-2xl bg-muted/30 border-border/40 focus:border-primary/40 focus:ring-4 focus:ring-primary/10 transition-all h-11 text-sm shadow-inner"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-5">
              <label className="block mb-2 text-xs uppercase tracking-wider font-semibold text-muted-foreground">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyPress}
                className="rounded-2xl bg-muted/30 border-border/40 focus:border-primary/40 focus:ring-4 focus:ring-primary/10 transition-all h-11 text-sm shadow-inner"
              />
            </div>

            {errorMessage ? (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs text-destructive text-center font-medium"
              >
                {errorMessage}
              </motion.div>
            ) : null}

            {/* Signup Button */}
            <motion.div whileTap={{ scale: 0.99 }}>
              <Button
                onClick={handleSignup}
                className="w-full h-11 rounded-2xl bg-gradient-to-r from-secondary via-primary to-accent text-white font-semibold shadow-lg shadow-secondary/20 hover:opacity-95 hover:shadow-xl transition-all"
                disabled={!email || !password || isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </motion.div>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/40" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-2 text-muted-foreground/60 text-[10px] font-semibold tracking-widest">or</span>
              </div>
            </div>

            <motion.div whileTap={{ scale: 0.99 }}>
              <Link
                href="/login"
                className="inline-flex w-full h-11 items-center justify-center rounded-2xl border border-border/40 bg-muted/10 text-foreground transition-all font-semibold hover:bg-muted/40"
              >
                Already have an account? Sign in
              </Link>
            </motion.div>

            <p className="text-center text-xs text-muted-foreground/70 pt-2">
              Draftly uses secure authentication powered by Supabase.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
