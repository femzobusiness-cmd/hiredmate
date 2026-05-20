'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import RankBadge from '@/components/gamification/RankBadge';
import Input from '@/components/ui/Input';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { ExperienceLevel, Specialty, UserPlan, UserProfile } from '@/lib/types';
import { cn } from '@/utils/cn';
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  LogOut,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';

const SPECIALTIES: Specialty[] = [
  'ICU',
  'ER',
  'Med-Surg',
  'L&D',
  'Oncology',
  'Pediatrics',
  'OR/Surgical',
  'Psych',
  'Travel Nurse',
  'Other',
];

const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  'New Graduate',
  'Early Career (1-3yr)',
  'Experienced (3yr+)',
  'Travel Nurse',
];

type Toast = {
  type: 'success' | 'error';
  message: string;
};

type SettingsClientProps = {
  initialProfile: UserProfile | null;
  user: {
    id: string;
    email: string;
  };
};

function getPlanLabel(plan: UserPlan | string | null | undefined) {
  if (plan === 'job_seeker') return 'Job Seeker';
  if (plan === 'premium') return 'Premium';
  return 'Free Plan';
}

function getResumeFileName(path: string | null | undefined) {
  if (!path) return null;
  return decodeURIComponent(path.split('/').pop() || 'Resume PDF');
}

function formatDate(date: string | null | undefined) {
  if (!date) return 'recently';
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

function sanitizeFileName(fileName: string) {
  const sanitized = fileName
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120);

  return sanitized || 'resume.pdf';
}

export default function SettingsClient({ initialProfile, user }: SettingsClientProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile);
  const [toast, setToast] = useState<Toast | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [firstName, setFirstName] = useState(initialProfile?.first_name || '');
  const [specialty, setSpecialty] = useState<Specialty | ''>(
    initialProfile?.specialty || ''
  );
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | ''>(
    initialProfile?.experience_level || ''
  );
  const [hospitalName, setHospitalName] = useState(initialProfile?.hospital_name || '');
  const [jobTitle, setJobTitle] = useState(initialProfile?.job_title || '');
  const [interviewDate, setInterviewDate] = useState(
    initialProfile?.interview_date || ''
  );
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(
    initialProfile?.sound_effects_enabled || false
  );

  const initials = useMemo(() => {
    const source = firstName.trim() || user.email.split('@')[0] || 'HM';
    return source
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [firstName, user.email]);

  const plan = (profile?.plan || 'free') as UserPlan;
  const resumeFileName = getResumeFileName(profile?.resume_url);

  const showToast = (nextToast: Toast) => {
    setToast(nextToast);
    window.setTimeout(() => setToast(null), 3500);
  };

  const updateProfile = async (
    updates: Partial<UserProfile>,
    successMessage: string
  ) => {
    const payload = {
      user_id: user.id,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;
    setProfile(data as UserProfile);
    showToast({ type: 'success', message: successMessage });
    router.refresh();
  };

  const saveProfile = async () => {
    setProfileLoading(true);
    try {
      await updateProfile(
        {
          first_name: firstName.trim() || null,
          specialty: specialty || null,
          experience_level: experienceLevel || null,
          sound_effects_enabled: soundEffectsEnabled,
        },
        'Profile saved.'
      );
      localStorage.setItem('sound_effects', soundEffectsEnabled ? 'true' : 'false');
    } catch (error) {
      showToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Could not save profile.',
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const saveInterviewDetails = async () => {
    setInterviewLoading(true);
    try {
      await updateProfile(
        {
          hospital_name: hospitalName.trim() || null,
          job_title: jobTitle.trim() || null,
          interview_date: interviewDate || null,
        },
        'Interview details saved.'
      );
    } catch (error) {
      showToast({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'Could not save interview details.',
      });
    } finally {
      setInterviewLoading(false);
    }
  };

  const uploadResume = async (file: File) => {
    if (file.type !== 'application/pdf') {
      showToast({ type: 'error', message: 'Please upload a PDF file.' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast({ type: 'error', message: 'Resume must be under 5MB.' });
      return;
    }

    setResumeLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const parseRes = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      });
      const parsed = (await parseRes.json()) as { text?: string; error?: string };

      if (!parseRes.ok || !parsed.text) {
        throw new Error(parsed.error || 'Unable to read text from this PDF.');
      }

      const filePath = `${user.id}/${Date.now()}-${sanitizeFileName(file.name)}`;
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      await updateProfile(
        {
          resume_url: filePath,
          resume_text: parsed.text,
        },
        'Resume uploaded and parsed.'
      );
    } catch (error) {
      showToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Could not upload resume.',
      });
    } finally {
      setResumeLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: (files) => {
      const file = files[0];
      if (file) void uploadResume(file);
    },
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    noClick: !!resumeFileName,
    disabled: resumeLoading,
  });

  const openCustomerPortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/create-portal', { method: 'POST' });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Could not open subscription portal.');
      }
      window.location.href = data.url;
    } catch (error) {
      showToast({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Could not open subscription portal.',
      });
      setPortalLoading(false);
    }
  };

  const signOut = async () => {
    setSignOutLoading(true);
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const deleteAccount = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch('/api/delete-account', { method: 'POST' });
      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        throw new Error(data.error || 'Could not delete account.');
      }

      await supabase.auth.signOut();
      router.push('/signup');
      router.refresh();
    } catch (error) {
      showToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Could not delete account.',
      });
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="space-y-8">
      {toast && (
        <div
          className={cn(
            'fixed right-5 top-5 z-50 rounded-card border bg-white px-4 py-3 text-sm font-semibold shadow-card',
            toast.type === 'success'
              ? 'border-green-200 text-green-700'
              : 'border-red-200 text-red-600'
          )}
        >
          {toast.message}
        </div>
      )}

      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-text-muted">
          Settings
        </p>
        <h1 className="mt-2 text-4xl font-bold text-text-primary">
          Workspace settings
        </h1>
        <p className="mt-2 text-text-secondary">
          Manage your profile, interview details, resume, subscription, and account.
        </p>
      </div>

      <Card className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Profile</h2>
          <p className="text-sm text-text-secondary">
            Keep your interview prep personalized.
          </p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-purple-gradient text-2xl font-black text-white shadow-button">
            {initials}
          </div>

          <div className="grid flex-1 gap-4 sm:grid-cols-2">
            <Input
              label="First name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              placeholder="Your first name"
            />
            <Input
              label="Email"
              value={user.email}
              readOnly
              className="cursor-not-allowed bg-border/40 text-text-muted"
            />

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                Specialty
              </label>
              <select
                value={specialty}
                onChange={(event) => setSpecialty(event.target.value as Specialty)}
                className="w-full rounded-input border border-input-border bg-input px-4 py-3 text-text-primary transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
              >
                <option value="">Select specialty</option>
                {SPECIALTIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                Experience level
              </label>
              <select
                value={experienceLevel}
                onChange={(event) =>
                  setExperienceLevel(event.target.value as ExperienceLevel)
                }
                className="w-full rounded-input border border-input-border bg-input px-4 py-3 text-text-primary transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
              >
                <option value="">Select experience</option>
                {EXPERIENCE_LEVELS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-card border border-border bg-input p-4">
          <RankBadge
            totalXp={profile?.total_xp || 0}
            title={profile?.rank_title || 'Student Nurse'}
            showProgress
          />
        </div>

        <div className="flex items-center justify-between rounded-card border border-border bg-white p-4">
          <div>
            <p className="font-bold text-text-primary">Sound Effects</p>
            <p className="text-sm text-text-secondary">
              Play claps, level-up notes, and wrong-answer cues during practice.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSoundEffectsEnabled((value) => !value)}
            className={cn(
              'relative h-8 w-14 rounded-full transition-colors',
              soundEffectsEnabled ? 'bg-primary' : 'bg-border'
            )}
          >
            <span
              className={cn(
                'absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform',
                soundEffectsEnabled ? 'translate-x-7' : 'translate-x-1'
              )}
            />
          </button>
        </div>

        <Button onClick={saveProfile} loading={profileLoading}>
          Save Changes
        </Button>
      </Card>

      <Card className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Interview Details</h2>
          <p className="text-sm text-text-secondary">
            Tell HiredMate what opportunity you are preparing for.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Hospital name"
            value={hospitalName}
            onChange={(event) => setHospitalName(event.target.value)}
            placeholder="e.g. Mayo Clinic"
          />
          <Input
            label="Job title"
            value={jobTitle}
            onChange={(event) => setJobTitle(event.target.value)}
            placeholder="e.g. Registered Nurse - ICU"
          />
          <Input
            label="Interview date"
            type="date"
            value={interviewDate}
            onChange={(event) => setInterviewDate(event.target.value)}
          />
        </div>

        <Button onClick={saveInterviewDetails} loading={interviewLoading}>
          Save Changes
        </Button>
      </Card>

      <Card className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Your Resume</h2>
          <p className="text-sm text-text-secondary">
            Upload a PDF so your practice questions can reflect your experience.
          </p>
        </div>

        <div
          {...getRootProps()}
          className={cn(
            'rounded-card border-2 border-dashed p-6 transition-all',
            isDragActive
              ? 'border-primary bg-input'
              : 'border-primary/50 bg-white hover:border-primary hover:bg-input/50',
            resumeLoading && 'pointer-events-none opacity-70'
          )}
        >
          <input {...getInputProps()} />
          {resumeLoading ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="font-semibold text-text-primary">
                Parsing and saving your resume...
              </p>
            </div>
          ) : resumeFileName ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-card bg-green-50 text-green-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-text-primary">{resumeFileName}</p>
                  <p className="text-sm text-text-secondary">
                    Uploaded on {formatDate(profile?.updated_at)}
                  </p>
                </div>
              </div>
              <Button type="button" variant="outline" onClick={open}>
                Replace Resume
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Upload className="h-7 w-7" />
              </div>
              <div>
                <p className="font-bold text-text-primary">Upload Resume PDF</p>
                <p className="mt-1 text-sm text-text-secondary">
                  Drag and drop or click to upload. PDF only, max 5MB.
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Subscription</h2>
            <p className="text-sm text-text-secondary">
              Manage your HiredMate plan.
            </p>
          </div>
          <span
            className={cn(
              'inline-flex w-fit rounded-pill px-4 py-2 text-sm font-bold',
              plan === 'premium'
                ? 'bg-gold/20 text-amber-700'
                : plan === 'job_seeker'
                  ? 'bg-primary text-white'
                  : 'bg-border text-text-secondary'
            )}
          >
            {getPlanLabel(plan)}
          </span>
        </div>

        {plan === 'free' ? (
          <div className="rounded-card border border-primary/20 bg-input p-5">
            <p className="font-semibold text-text-primary">
              You are on the free plan with 3 total practice sessions.
            </p>
            <Link
              href="/pricing"
              className="mt-4 inline-flex items-center justify-center rounded-pill bg-purple-gradient px-6 py-3 font-semibold text-white shadow-button transition hover:scale-[1.02] hover:brightness-105"
            >
              Upgrade to Job Seeker →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={openCustomerPortal} loading={portalLoading}>
              Manage Subscription
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="text-red-600 hover:bg-red-50"
              onClick={openCustomerPortal}
              loading={portalLoading}
            >
              Cancel subscription option
            </Button>
          </div>
        )}
      </Card>

      <Card className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Account</h2>
          <p className="text-sm text-text-secondary">
            Signed in as <span className="font-semibold">{user.email}</span>
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="ghost"
            className="justify-start text-red-600 hover:bg-red-50"
            onClick={signOut}
            loading={signOutLoading}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
          <Button
            variant="ghost"
            className="justify-start text-red-600 hover:bg-red-50"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete Account
          </Button>
        </div>
      </Card>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-primary/40 px-4 backdrop-blur-sm">
          <Card className="max-w-md space-y-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-red-50 text-red-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-primary">
                  Delete your account?
                </h2>
                <p className="mt-2 text-sm text-text-secondary">
                  This permanently deletes your HiredMate account and profile data.
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteLoading}
              >
                <X className="h-4 w-4" />
                Keep Account
              </Button>
              <Button
                variant="danger"
                onClick={deleteAccount}
                loading={deleteLoading}
              >
                Delete Account
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
