'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Logo from '@/components/ui/Logo';
import { FloatingParticles } from '@/components/ui/FloatingParticles';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { Brain, ShieldCheck, Stethoscope } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('onboarding_completed')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id ?? '')
        .maybeSingle();

      if (profile?.onboarding_completed) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (authError) throw authError;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-purple-gradient p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <FloatingParticles />
        <div className="flex items-center gap-2">
          <Image
            src="/hiredmate-logo.png"
            alt="HiredMate"
            width={40}
            height={40}
            className="rounded-xl"
          />
          <span style={{ fontFamily: "'Fredoka One', cursive" }} className="text-xl font-bold">
            <span className="text-white">Hired</span>
            <span className="ml-1 rounded-lg bg-white/20 px-2 py-0.5 text-white">Mate</span>
          </span>
        </div>
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-secondary">
            Free during beta — full access
          </p>
          <h1 className="max-w-xl text-5xl font-bold leading-tight text-white">
            Clinical confidence for every healthcare interview.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-white/80">
            Practice role-specific scenarios, sharpen clinical reasoning, and
            walk into interviews with polished answers.
          </p>
        </div>
        <div className="relative z-10 grid gap-4">
          {[
            { icon: Brain, text: 'AI coaching tailored to your specialty' },
            { icon: Stethoscope, text: 'Clinical scenario practice that feels real' },
            { icon: ShieldCheck, text: 'Structured feedback for safer answers' },
          ].map((feature, i) => (
            <motion.div
              key={feature.text}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.2 }}
              className="flex items-center gap-3 text-white/85"
            >
              <feature.icon className="h-5 w-5 text-white" />
              <span>{feature.text}</span>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="flex items-center justify-center bg-page-bg p-6">
        <Card className="w-full max-w-md">
          <div className="mb-8">
            <Logo size="md" className="mb-8 lg:hidden" />
            <h2 className="text-3xl font-bold text-text-primary">Welcome back</h2>
            <p className="mt-2 text-text-secondary">Sign in to continue your prep.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input label="Email" type="email" placeholder="you@hospital.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />

            {error && <p className="rounded-card border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}

            <Button type="submit" loading={loading} className="w-full">Sign In</Button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-sm text-text-muted">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button variant="secondary" className="w-full" loading={googleLoading} onClick={handleGoogleLogin} type="button">
            Continue with Google
          </Button>

          <p className="mt-6 text-center text-sm text-text-secondary">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold text-primary hover:text-secondary">
              Sign up
            </Link>
          </p>
        </Card>
      </section>
    </div>
  );
}
