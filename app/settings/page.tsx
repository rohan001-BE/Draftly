'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Settings, Shield, Sparkles } from 'lucide-react';
import { TopNavbar } from '@/components/common/top-navbar';
import { Sidebar } from '@/components/common/sidebar';
import { AnimatedBackground } from '@/components/common/animated-background';
import { UserAvatar } from '@/components/common/user-avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks';

export default function SettingsPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-y-auto bg-background sm:flex-row">
      <Sidebar onLogout={handleLogout} showLogo={false} user={user} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopNavbar user={user} onLogout={handleLogout} />

        <main className="relative flex-1 overflow-auto">
          <AnimatedBackground variant="subtle" />

          <div className="relative mx-auto max-w-4xl px-4 py-8 sm:px-8 sm:py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative mb-10 overflow-hidden rounded-[2rem] border border-white/20 bg-gradient-to-br from-slate-950 via-blue-900 to-fuchsia-800 p-8 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.35)]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.15),transparent_35%)]" />
              <div className="relative flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-white/70">Account</p>
                  <h1 className="mt-1 text-3xl font-bold text-white sm:text-4xl">Settings</h1>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-slate-200/90">
                    Customize your account, appearance, and workspace preferences.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.45 }}
            >
              <Card className="mb-8 overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/85 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.12)] backdrop-blur-xl">
                <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-blue-50/50 via-white to-violet-50/50 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-500 shadow-lg">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-slate-900">Profile</CardTitle>
                      <CardDescription className="text-sm">Your account information</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-8 pt-8">
                  <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                    <UserAvatar user={user} size="xl" showRing showStatus interactive />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900">{user?.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">{user?.email}</p>
                      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Active account
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-slate-100" />

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Account Type</p>
                      <p className="mt-2 font-semibold capitalize text-slate-900">{user?.role ?? 'Member'}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Member Since</p>
                      <p className="mt-2 font-semibold text-slate-900">
                        {user?.createdAt
                          ? new Date(user.createdAt).toLocaleDateString('en-US', {
                              month: 'long',
                              year: 'numeric',
                            })
                          : 'Not available'}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="h-11 w-full rounded-2xl border-slate-200 font-semibold hover:border-blue-200 hover:bg-blue-50/50"
                  >
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.45 }}
            >
              <Card className="mb-6 overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/85 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.1)] backdrop-blur-xl">
                <CardHeader className="border-b border-slate-100 pb-5">
                  <CardTitle className="text-slate-900">Preferences</CardTitle>
                  <CardDescription>Customize your experience</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-gradient-to-r from-amber-50/50 via-white to-orange-50/40 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md">
                        {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Dark Mode</p>
                        <p className="text-sm text-slate-500">{isDarkMode ? 'Enabled' : 'Disabled'}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleDarkMode}
                      className="rounded-xl border-slate-200 font-semibold"
                    >
                      {isDarkMode ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26, duration: 0.45 }}
            >
              <Card className="overflow-hidden rounded-[1.75rem] border border-red-200/80 bg-gradient-to-br from-red-50/80 via-white to-rose-50/50 shadow-sm">
                <CardHeader className="border-b border-red-100 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
                      <Shield className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-red-600">Danger Zone</CardTitle>
                      <CardDescription>Irreversible actions</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <p className="text-sm text-slate-500">Logging out will end your current session.</p>
                  <Button
                    variant="destructive"
                    className="h-11 w-full rounded-2xl font-semibold shadow-sm"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
