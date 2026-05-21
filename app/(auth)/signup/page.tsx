'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Logo from '@/components/ui/Logo';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { Brain, ClipboardCheck, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function SignupPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`;

      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName },
          emailRedirectTo: redirectUrl,
        },
      });

      if (authError) throw authError;

      if (data.user) {
        await supabase.from('user_profiles').upsert({
          user_id: data.user.id,
          first_name: firstName,
          onboarding_completed: false,
          updated_at: new Date().toISOString(),
        });
      }

      router.push('/onboarding');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
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
      setError(err instanceof Error ? err.message : 'Google sign-up failed');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden bg-purple-gradient p-12 text-white lg:flex lg:flex-col lg:justify-between">
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
            Built for healthcare professionals
          </p>
          <h1 className="max-w-xl text-5xl font-bold leading-tight text-white">
            Prepare with the structure top candidates use.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-white/80">
            Build a focused prep plan, practice clinical scenarios, and get
            feedback that improves every answer.
          </p>
        </div>
        <div className="grid gap-4">
          {[
            { icon: ClipboardCheck, text: 'Personalized onboarding in minutes' },
            { icon: Brain, text: 'Specialty-specific AI practice sessions' },
            { icon: ShieldCheck, text: 'Confident answers for high-stakes interviews' },
          ].map((feature) => (
            <div key={feature.text} className="flex items-center gap-3 text-white/85">
              <feature.icon className="h-5 w-5 text-white" />
              <span>{feature.text}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex items-center justify-center bg-page-bg p-6">
        <Card className="w-full max-w-md">
          <div className="mb-8">
            <Logo size="md" className="mb-8 lg:hidden" />
            <h2 className="text-3xl font-bold text-text-primary">Create your account</h2>
            <p className="mt-2 text-text-secondary">Start your interview prep journey.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <Input label="First name" placeholder="Sarah" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            <Input label="Email" type="email" placeholder="you@hospital.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Password" type="password" placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />

            {error && <p className="rounded-card border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}

            <Button type="submit" loading={loading} className="w-full">Create Account</Button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-sm text-text-muted">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button variant="secondary" className="w-full" loading={googleLoading} onClick={handleGoogleSignup} type="button">
            Continue with Google
          </Button>

          <p className="mt-6 text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary hover:text-secondary">
              Sign in
            </Link>
          </p>
        </Card>
      </section>
    </div>
  );
}
