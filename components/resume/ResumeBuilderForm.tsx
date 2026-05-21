'use client';

import Input from '@/components/ui/Input';
import {
  ATS_TARGET_OPTIONS,
  CERTIFICATION_OPTIONS,
  CLINICAL_SKILLS,
  DEGREE_OPTIONS,
  EXPERIENCE_OPTIONS,
  RESUME_SPECIALTIES,
  SOFT_SKILLS,
  createEmptyEducationEntry,
  createEmptyWorkEntry,
  defaultResumeFormData,
  type ResumeFormData,
  type ResumeFormat,
  type ResumeSpecialty,
} from '@/lib/resume';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { cn } from '@/utils/cn';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ResumeHeadshotUpload } from './ResumeHeadshotUpload';
import { ResumeProgressBar } from './ResumeProgressBar';

const GENERATION_MESSAGES = [
  'Reviewing your clinical experience…',
  'Injecting ATS keywords for your specialty…',
  'Crafting action-verb bullet points…',
  'Tailoring language to your target role…',
  'Polishing your nursing resume…',
];

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
};

type Props = {
  resumeId?: string;
  initialData?: ResumeFormData;
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function ResumeBuilderForm({ resumeId, initialData }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [formData, setFormData] = useState<ResumeFormData>(
    initialData ?? defaultResumeFormData()
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generatingStep, setGeneratingStep] = useState(0);
  const [loadingInitial, setLoadingInitial] = useState(!!resumeId);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [bulletLoadingId, setBulletLoadingId] = useState<string | null>(null);
  const generateStarted = useRef(false);

  useEffect(() => {
    if (!resumeId) return;
    let cancelled = false;
    (async () => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('resumes')
        .select('resume_data')
        .eq('id', resumeId)
        .single();
      if (cancelled) return;
      if (!error && data?.resume_data) {
        const loaded = data.resume_data as ResumeFormData;
        const defaults = defaultResumeFormData();
        setFormData({
          ...defaults,
          ...loaded,
          personal: {
            ...defaults.personal,
            ...loaded.personal,
            headshotBase64: loaded.personal?.headshotBase64 ?? null,
          },
        });
      }
      setLoadingInitial(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [resumeId]);

  useEffect(() => {
    if (initialData && !resumeId) setFormData(initialData);
  }, [initialData, resumeId]);

  const goTo = useCallback((next: number, dir: 1 | -1) => {
    setDirection(dir);
    setStep(next);
  }, []);

  const updatePersonal = <K extends keyof ResumeFormData['personal']>(
    key: K,
    value: ResumeFormData['personal'][K]
  ) => {
    setFormData((d) => ({
      ...d,
      personal: { ...d.personal, [key]: value },
    }));
    setErrors((e) => {
      const next = { ...e };
      delete next[key];
      return next;
    });
  };

  const validateStep1 = (): boolean => {
    const next: Record<string, string> = {};
    if (!formData.personal.fullName.trim())
      next.fullName = 'Full name is required';
    if (!formData.personal.email.trim()) next.email = 'Email is required';
    else if (!isValidEmail(formData.personal.email))
      next.email = 'Enter a valid email';
    if (!formData.personal.targetRole.trim())
      next.targetRole = 'Target role is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 4) {
      goTo(5, 1);
      return;
    }
    if (step < 4) goTo(step + 1, 1);
  };

  const handleBack = () => {
    if (step > 1 && step < 5) goTo(step - 1, -1);
  };

  const toggleCert = (cert: string) => {
    setFormData((d) => ({
      ...d,
      certifications: d.certifications.includes(cert)
        ? d.certifications.filter((c) => c !== cert)
        : [...d.certifications, cert],
    }));
  };

  const toggleClinical = (skill: string) => {
    setFormData((d) => ({
      ...d,
      clinicalSkills: d.clinicalSkills.includes(skill)
        ? d.clinicalSkills.filter((s) => s !== skill)
        : [...d.clinicalSkills, skill],
    }));
  };

  const toggleSoft = (skill: string) => {
    setFormData((d) => {
      const has = d.softSkills.includes(skill);
      const softSkills = has
        ? d.softSkills.filter((s) => s !== skill)
        : [...d.softSkills, skill];
      return {
        ...d,
        softSkills,
        bilingualLanguage:
          skill === 'Bilingual' && has ? '' : d.bilingualLanguage,
      };
    });
  };

  const generateBullets = async (workId: string) => {
    const entry = formData.workExperience.find((w) => w.id === workId);
    if (!entry?.jobTitle?.trim() || !entry?.employer?.trim()) {
      setErrors((e) => ({
        ...e,
        [`work-${workId}`]: 'Job title and employer required for AI bullets',
      }));
      return;
    }
    setBulletLoadingId(workId);
    try {
      const res = await fetch('/api/resume/generate-bullets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: entry.jobTitle,
          employer: entry.employer,
          specialty: formData.personal.specialty,
          unit: entry.unit,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate');
      setFormData((d) => ({
        ...d,
        workExperience: d.workExperience.map((w) =>
          w.id === workId ? { ...w, bullets: data.bullets as string[] } : w
        ),
      }));
    } catch {
      setErrors((e) => ({
        ...e,
        [`work-${workId}`]: 'Could not generate bullets. Try again.',
      }));
    } finally {
      setBulletLoadingId(null);
    }
  };

  useEffect(() => {
    if (step !== 5 || generateStarted.current) return;
    generateStarted.current = true;
    setGenerateError(null);
    setGeneratingStep(0);

    const timers = [
      setTimeout(() => setGeneratingStep(1), 1500),
      setTimeout(() => setGeneratingStep(2), 3000),
      setTimeout(() => setGeneratingStep(3), 4500),
      setTimeout(() => setGeneratingStep(4), 5500),
    ];

    const minAnim = new Promise((r) => setTimeout(r, 6000));

    (async () => {
      try {
        const [res] = await Promise.all([
          fetch('/api/resume/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ formData, resumeId }),
          }),
          minAnim,
        ]);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Generation failed');
        const id = (data.resumeId as string) || resumeId;
        if (!id) throw new Error('No resume id returned');
        router.push(`/resume-builder/preview/${id}`);
      } catch (err) {
        setGenerateError(
          err instanceof Error ? err.message : 'Failed to generate resume'
        );
        generateStarted.current = false;
      }
    })();

    return () => timers.forEach(clearTimeout);
  }, [step, formData, resumeId, router]);

  const pillClass = (selected: boolean) =>
    cn(
      'rounded-pill border-2 px-4 py-2 text-sm font-medium transition-all',
      selected
        ? 'border-[#7C5CBF] bg-[#7C5CBF] text-white'
        : 'border-[#7C5CBF]/40 bg-white text-[#7C5CBF] hover:bg-[#7C5CBF]/5'
    );

  const updateWork = (id: string, patch: Partial<ResumeFormData['workExperience'][0]>) => {
    setFormData((d) => ({
      ...d,
      workExperience: d.workExperience.map((w) =>
        w.id === id ? { ...w, ...patch } : w
      ),
    }));
  };

  const updateEducation = (
    id: string,
    patch: Partial<ResumeFormData['education'][0]>
  ) => {
    setFormData((d) => ({
      ...d,
      education: d.education.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  };

  if (loadingInitial) {
    return (
      <motion.div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#7C5CBF]" />
      </motion.div>
    );
  }

  if (step === 5) {
    return (
      <motion.div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[#1A0533] to-[#2D1B69] px-6 text-white">
        <ResumeProgressBar currentStep={5} />
        <AnimatePresence mode="wait">
          <motion.div
            key={generatingStep}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-8 max-w-md text-center"
          >
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-[#00C6B2]" />
            <p className="mt-6 text-xl font-bold">
              {GENERATION_MESSAGES[generatingStep]}
            </p>
          </motion.div>
        </AnimatePresence>
        <div className="mt-10 h-2 w-full max-w-md overflow-hidden rounded-pill bg-white/20">
          <motion.div
            className="h-full rounded-pill bg-gradient-to-r from-[#00C6B2] to-[#7C5CBF]"
            animate={{ width: `${((generatingStep + 1) / 5) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        {generateError && (
          <motion.div className="mt-8 max-w-md rounded-[20px] bg-red-500/20 p-4 text-center text-sm">
            <p>{generateError}</p>
            <button
              type="button"
              onClick={() => {
                generateStarted.current = false;
                setGenerateError(null);
                goTo(4, -1);
              }}
              className="mt-3 rounded-pill border border-white/40 px-5 py-2 text-sm font-bold"
            >
              Go Back
            </button>
          </motion.div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-2xl px-4 py-6"
    >
      <ResumeProgressBar currentStep={step} />

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          className="rounded-[20px] bg-white p-6 shadow-card sm:p-8"
        >
          {step === 1 && (
            <>
              <h2 className="text-xl font-bold text-text-primary">
                Personal Information
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                Tell us about yourself and your target role
              </p>
              <div className="mt-6 space-y-4">
                <ResumeHeadshotUpload
                  headshotBase64={formData.personal.headshotBase64}
                  onChange={(headshotBase64) =>
                    updatePersonal('headshotBase64', headshotBase64)
                  }
                />
                <Input
                  label="Full Name"
                  value={formData.personal.fullName}
                  onChange={(e) => updatePersonal('fullName', e.target.value)}
                  error={errors.fullName}
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.personal.email}
                  onChange={(e) => updatePersonal('email', e.target.value)}
                  error={errors.email}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Phone"
                    value={formData.personal.phone}
                    onChange={(e) => updatePersonal('phone', e.target.value)}
                  />
                  <Input
                    label="Location"
                    placeholder="City, State"
                    value={formData.personal.location}
                    onChange={(e) =>
                      updatePersonal('location', e.target.value)
                    }
                  />
                </div>
                <Input
                  label="LinkedIn (optional)"
                  value={formData.personal.linkedIn}
                  onChange={(e) => updatePersonal('linkedIn', e.target.value)}
                />
                <Input
                  label="Target Role"
                  placeholder="e.g. ICU Staff Nurse"
                  value={formData.personal.targetRole}
                  onChange={(e) =>
                    updatePersonal('targetRole', e.target.value)
                  }
                  error={errors.targetRole}
                />
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                    Specialty
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {RESUME_SPECIALTIES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() =>
                          updatePersonal('specialty', s as ResumeSpecialty)
                        }
                        className={pillClass(formData.personal.specialty === s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                    Years of Experience
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {EXPERIENCE_OPTIONS.map((y) => (
                      <button
                        key={y}
                        type="button"
                        onClick={() => updatePersonal('yearsExperience', y)}
                        className={pillClass(
                          formData.personal.yearsExperience === y
                        )}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold text-text-primary">
                    Professional Summary
                  </p>
                  <div className="space-y-2">
                    {(
                      [
                        ['ai', 'Let AI write my summary'],
                        ['own', 'I will write my own'],
                      ] as const
                    ).map(([val, label]) => (
                      <label
                        key={val}
                        className={cn(
                          'flex cursor-pointer items-center gap-3 rounded-card border-2 p-3',
                          formData.personal.summaryPreference === val
                            ? 'border-[#7C5CBF] bg-[#7C5CBF]/5'
                            : 'border-border'
                        )}
                      >
                        <input
                          type="radio"
                          name="summaryPreference"
                          checked={formData.personal.summaryPreference === val}
                          onChange={() =>
                            updatePersonal('summaryPreference', val)
                          }
                          className="accent-[#7C5CBF]"
                        />
                        <span className="text-sm font-medium">{label}</span>
                      </label>
                    ))}
                  </div>
                  {formData.personal.summaryPreference === 'own' && (
                    <textarea
                      className="mt-3 w-full rounded-input border border-input-border bg-input px-4 py-3 text-sm text-text-primary focus:border-[#7C5CBF] focus:outline-none focus:ring-4 focus:ring-[#7C5CBF]/15"
                      rows={4}
                      placeholder="Write your professional summary…"
                      value={formData.personal.ownSummary}
                      onChange={(e) =>
                        updatePersonal('ownSummary', e.target.value)
                      }
                    />
                  )}
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-text-primary">
                    Work Experience
                  </h2>
                  <p className="mt-1 text-sm text-text-secondary">
                    Add your nursing roles and accomplishments
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((d) => ({
                      ...d,
                      workExperience: [
                        ...d.workExperience,
                        createEmptyWorkEntry(),
                      ],
                    }))
                  }
                  className="flex items-center gap-1 rounded-pill border-2 border-[#7C5CBF] px-3 py-1.5 text-xs font-bold text-[#7C5CBF]"
                >
                  <Plus className="h-4 w-4" /> Add
                </button>
              </div>
              {formData.workExperience.length === 0 ? (
                <div className="mt-10 rounded-card border-2 border-dashed border-border py-12 text-center">
                  <p className="text-text-secondary">No work entries yet</p>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((d) => ({
                        ...d,
                        workExperience: [createEmptyWorkEntry()],
                      }))
                    }
                    className="mt-4 rounded-pill bg-[#7C5CBF]/10 px-5 py-2 text-sm font-bold text-[#7C5CBF]"
                  >
                    Add Your First Role
                  </button>
                </div>
              ) : (
                <div className="mt-6 space-y-8">
                  {formData.workExperience.map((work, idx) => (
                    <div
                      key={work.id}
                      className="relative rounded-card border border-border p-4"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((d) => ({
                            ...d,
                            workExperience: d.workExperience.filter(
                              (w) => w.id !== work.id
                            ),
                          }))
                        }
                        className="absolute right-3 top-3 text-red-500"
                        aria-label="Remove role"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <p className="mb-3 text-xs font-bold uppercase text-text-muted">
                        Role {idx + 1}
                      </p>
                      <div className="space-y-3 pr-6">
                        <Input
                          label="Job Title"
                          value={work.jobTitle}
                          onChange={(e) =>
                            updateWork(work.id, { jobTitle: e.target.value })
                          }
                        />
                        <Input
                          label="Employer"
                          value={work.employer}
                          onChange={(e) =>
                            updateWork(work.id, { employer: e.target.value })
                          }
                        />
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Input
                            label="Location"
                            value={work.location}
                            onChange={(e) =>
                              updateWork(work.id, { location: e.target.value })
                            }
                          />
                          <Input
                            label="Unit"
                            value={work.unit}
                            onChange={(e) =>
                              updateWork(work.id, { unit: e.target.value })
                            }
                          />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Input
                            label="Start Date"
                            placeholder="MM/YYYY"
                            value={work.startDate}
                            onChange={(e) =>
                              updateWork(work.id, { startDate: e.target.value })
                            }
                          />
                          <Input
                            label="End Date"
                            placeholder="MM/YYYY"
                            value={work.endDate}
                            disabled={work.isPresent}
                            onChange={(e) =>
                              updateWork(work.id, { endDate: e.target.value })
                            }
                          />
                        </div>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={work.isPresent}
                            onChange={(e) =>
                              updateWork(work.id, {
                                isPresent: e.target.checked,
                                endDate: e.target.checked ? '' : work.endDate,
                              })
                            }
                            className="accent-[#7C5CBF]"
                          />
                          I currently work here
                        </label>
                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-semibold">
                              Bullet Points
                            </p>
                            <button
                              type="button"
                              disabled={bulletLoadingId === work.id}
                              onClick={() => generateBullets(work.id)}
                              className="flex items-center gap-1 rounded-pill bg-gradient-to-r from-[#7C5CBF] to-[#6B4FA8] px-3 py-1 text-xs font-bold text-white disabled:opacity-60"
                            >
                              {bulletLoadingId === work.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Sparkles className="h-3 w-3" />
                              )}
                              AI Generate
                            </button>
                          </div>
                          {errors[`work-${work.id}`] && (
                            <p className="mb-2 text-sm text-red-500">
                              {errors[`work-${work.id}`]}
                            </p>
                          )}
                          {work.bullets.map((bullet, bi) => (
                            <input
                              key={bi}
                              className="mb-2 w-full rounded-input border border-input-border bg-input px-3 py-2 text-sm"
                              placeholder={`Bullet ${bi + 1}`}
                              value={bullet}
                              onChange={(e) =>
                                setFormData((d) => ({
                                  ...d,
                                  workExperience: d.workExperience.map((w) =>
                                    w.id === work.id
                                      ? {
                                          ...w,
                                          bullets: w.bullets.map((b, i) =>
                                            i === bi ? e.target.value : b
                                          ),
                                        }
                                      : w
                                  ),
                                }))
                              }
                            />
                          ))}
                          <button
                            type="button"
                            onClick={() =>
                              updateWork(work.id, {
                                bullets: [...work.bullets, ''],
                              })
                            }
                            className="text-xs font-semibold text-[#7C5CBF]"
                          >
                            + Add bullet
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-text-primary">
                    Education & Certifications
                  </h2>
                  <p className="mt-1 text-sm text-text-secondary">
                    Degrees, licenses, and credentials
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((d) => ({
                      ...d,
                      education: [...d.education, createEmptyEducationEntry()],
                    }))
                  }
                  className="flex items-center gap-1 rounded-pill border-2 border-[#7C5CBF] px-3 py-1.5 text-xs font-bold text-[#7C5CBF]"
                >
                  <Plus className="h-4 w-4" /> Add
                </button>
              </div>
              <div className="mt-6 space-y-6">
                {formData.education.map((edu, idx) => (
                  <div
                    key={edu.id}
                    className="relative rounded-card border border-border p-4"
                  >
                    {formData.education.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((d) => ({
                            ...d,
                            education: d.education.filter((e) => e.id !== edu.id),
                          }))
                        }
                        className="absolute right-3 top-3 text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    <p className="mb-3 text-xs font-bold uppercase text-text-muted">
                      Education {idx + 1}
                    </p>
                    <div className="space-y-3 pr-6">
                      <div>
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                          Degree
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {DEGREE_OPTIONS.map((deg) => (
                            <button
                              key={deg}
                              type="button"
                              onClick={() => updateEducation(edu.id, { degree: deg })}
                              className={pillClass(edu.degree === deg)}
                            >
                              {deg}
                            </button>
                          ))}
                        </div>
                      </div>
                      <Input
                        label="School"
                        value={edu.schoolName}
                        onChange={(e) =>
                          updateEducation(edu.id, { schoolName: e.target.value })
                        }
                      />
                      <div className="grid gap-3 sm:grid-cols-3">
                        <Input
                          label="Grad Year"
                          value={edu.graduationYear}
                          onChange={(e) =>
                            updateEducation(edu.id, {
                              graduationYear: e.target.value,
                            })
                          }
                        />
                        <Input
                          label="GPA"
                          value={edu.gpa}
                          onChange={(e) =>
                            updateEducation(edu.id, { gpa: e.target.value })
                          }
                        />
                        <Input
                          label="Honors"
                          value={edu.honors}
                          onChange={(e) =>
                            updateEducation(edu.id, { honors: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <p className="mb-3 text-sm font-semibold text-text-primary">
                  Certifications
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {CERTIFICATION_OPTIONS.map((cert) => (
                    <label
                      key={cert}
                      className="flex cursor-pointer items-center gap-2 rounded-card border border-border px-3 py-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={formData.certifications.includes(cert)}
                        onChange={() => toggleCert(cert)}
                        className="accent-[#7C5CBF]"
                      />
                      {cert}
                    </label>
                  ))}
                </div>
                <Input
                  label="Other Certifications"
                  placeholder="Comma-separated"
                  className="mt-4"
                  value={formData.otherCertifications}
                  onChange={(e) =>
                    setFormData((d) => ({
                      ...d,
                      otherCertifications: e.target.value,
                    }))
                  }
                />
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h2 className="text-xl font-bold text-text-primary">
                Skills & Format
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                Clinical skills, soft skills, and resume style
              </p>
              <div className="mt-6 space-y-6">
                {Object.entries(CLINICAL_SKILLS).map(([category, skills]) => (
                  <div key={category}>
                    <p className="mb-2 text-sm font-bold text-text-primary">
                      {category}
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {skills.map((skill) => (
                        <label
                          key={skill}
                          className="flex cursor-pointer items-center gap-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={formData.clinicalSkills.includes(skill)}
                            onChange={() => toggleClinical(skill)}
                            className="accent-[#7C5CBF]"
                          />
                          {skill}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <div>
                  <p className="mb-2 text-sm font-semibold">Soft Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {SOFT_SKILLS.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSoft(skill)}
                        className={pillClass(formData.softSkills.includes(skill))}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                  {formData.softSkills.includes('Bilingual') && (
                    <Input
                      label="Language"
                      className="mt-3"
                      placeholder="e.g. Spanish"
                      value={formData.bilingualLanguage}
                      onChange={(e) =>
                        setFormData((d) => ({
                          ...d,
                          bilingualLanguage: e.target.value,
                        }))
                      }
                    />
                  )}
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold">ATS Target</p>
                  <div className="flex flex-wrap gap-2">
                    {ATS_TARGET_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() =>
                          setFormData((d) => ({ ...d, atsTarget: opt }))
                        }
                        className={pillClass(formData.atsTarget === opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-3 text-sm font-semibold">Resume Format</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {(
                      [
                        {
                          id: 'classic' as ResumeFormat,
                          title: 'Classic',
                          desc: 'Traditional single-column layout',
                        },
                        {
                          id: 'modern' as ResumeFormat,
                          title: 'Modern',
                          desc: 'Clean headers with accent color',
                        },
                      ] as const
                    ).map((fmt) => {
                      const selected = formData.format === fmt.id;
                      return (
                        <button
                          key={fmt.id}
                          type="button"
                          onClick={() =>
                            setFormData((d) => ({ ...d, format: fmt.id }))
                          }
                          className={cn(
                            'rounded-[16px] border-2 p-4 text-left transition',
                            selected
                              ? 'border-[#7C5CBF] ring-4 ring-[#7C5CBF]/20'
                              : 'border-border hover:border-[#7C5CBF]/50'
                          )}
                        >
                          <motion.div
                            className={cn(
                              'mb-3 h-24 rounded-lg p-3',
                              fmt.id === 'classic'
                                ? 'bg-gray-100'
                                : 'bg-gradient-to-br from-[#7C5CBF]/20 to-[#00C6B2]/20'
                            )}
                          >
                            <div className="h-2 w-16 rounded bg-gray-300" />
                            <div className="mt-2 space-y-1">
                              <div className="h-1 w-full rounded bg-gray-200" />
                              <motion.div className="h-1 w-4/5 rounded bg-gray-200" />
                              <div className="h-1 w-3/5 rounded bg-gray-200" />
                            </div>
                          </motion.div>
                          <p className="font-bold text-text-primary">
                            {fmt.title}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {fmt.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex gap-3">
        {step > 1 && (
          <button
            type="button"
            onClick={handleBack}
            className="flex-1 rounded-pill border-2 border-[#7C5CBF] py-3 text-sm font-bold text-[#7C5CBF]"
          >
            Back
          </button>
        )}
        <button
          type="button"
          onClick={handleNext}
          className={cn(
            'rounded-pill bg-gradient-to-r from-[#7C5CBF] to-[#6B4FA8] py-3 text-sm font-bold text-white shadow-card',
            step > 1 ? 'flex-1' : 'w-full'
          )}
        >
          {step === 4 ? 'Generate My Resume →' : 'Next'}
        </button>
      </div>
    </motion.div>
  );
}
