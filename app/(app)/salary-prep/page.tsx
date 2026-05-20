'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { cn } from '@/utils/cn';
import {
  Bot,
  Copy,
  DollarSign,
  Loader2,
  MessageSquare,
  Send,
  X,
} from 'lucide-react';
import { FormEvent, useState } from 'react';

type SalaryScript = {
  opening_statement: string;
  counter_offer: string;
  handling_pushback: string;
  walk_away_number: string;
};

type CopiedKey = keyof SalaryScript | null;

const experienceOptions = [
  'New Grad',
  '1-3 years',
  '3-5 years',
  '5-10 years',
  '10+ years',
];

const specialtyOptions = [
  'ICU',
  'ER',
  'Med-Surg',
  'L&D',
  'Oncology',
  'Pediatrics',
  'OR',
  'Psych',
  'Travel Nurse',
  'Other',
];

const outputCards: {
  key: keyof SalaryScript;
  title: string;
  description: string;
  borderColor: string;
}[] = [
  {
    key: 'opening_statement',
    title: 'Opening Statement',
    description: 'Use this when they first ask about your salary expectations',
    borderColor: 'border-l-primary',
  },
  {
    key: 'counter_offer',
    title: 'Counter Offer Response',
    description: 'Use this when their offer is below your target',
    borderColor: 'border-l-secondary',
  },
  {
    key: 'handling_pushback',
    title: 'Handling Pushback',
    description: 'Use this when they say the budget is fixed',
    borderColor: 'border-l-gold',
  },
  {
    key: 'walk_away_number',
    title: 'Walk Away Number',
    description: 'Your absolute minimum — know this before you call',
    borderColor: 'border-l-red-500',
  },
];

export default function SalaryPrepPage() {
  const [jobTitle, setJobTitle] = useState('');
  const [hospital, setHospital] = useState('');
  const [location, setLocation] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('New Grad');
  const [currentSalary, setCurrentSalary] = useState('');
  const [targetSalary, setTargetSalary] = useState('');
  const [specialty, setSpecialty] = useState('ICU');
  const [script, setScript] = useState<SalaryScript | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<CopiedKey>(null);
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [practiceInput, setPracticeInput] = useState('');
  const [messages, setMessages] = useState<
    { role: 'recruiter' | 'user'; text: string }[]
  >([]);

  const handleGenerate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/salary-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle,
          hospital,
          location,
          experienceLevel,
          currentSalary,
          targetSalary,
          specialty,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate salary script');
      }

      setScript(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const copySection = async (key: keyof SalaryScript) => {
    if (!script) return;
    await navigator.clipboard?.writeText(script[key]);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const openPractice = () => {
    setPracticeOpen(true);
    setMessages([
      {
        role: 'recruiter',
        text:
          'Thanks for taking the time to talk today. Before we move forward, can you share what salary range you are expecting for this role?',
      },
    ]);
  };

  const sendPracticeMessage = () => {
    if (!practiceInput.trim()) return;

    const userMessage = practiceInput.trim();
    setPracticeInput('');
    setMessages((current) => [
      ...current,
      { role: 'user', text: userMessage },
      {
        role: 'recruiter',
        text:
          current.length < 3
            ? 'I appreciate that. Our current range may be a bit lower than your target. How would you respond if the offer came in below that number?'
            : 'That is helpful context. The budget is fairly tight, but I can take your request back to the hiring team. What part of the compensation package matters most to you?',
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-dark-bg px-4 py-10 text-text-primary sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <section className="text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-card border border-primary/30 bg-primary/10">
            <DollarSign className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
            Know Your Worth
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-text-secondary">
            Practice salary negotiation before the recruiter calls. Know your
            number. Own the conversation.
          </p>
        </section>

        <Card className="mx-auto max-w-[600px]">
          <h2 className="mb-6 text-2xl font-bold text-text-primary">
            Generate Your Negotiation Script
          </h2>

          <form onSubmit={handleGenerate} className="space-y-5">
            <Input
              label="Job Title"
              placeholder="Registered Nurse - ICU"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              required
            />
            <Input
              label="Hospital / Employer"
              placeholder="Mayo Clinic, HCA, Kaiser..."
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
            />
            <Input
              label="Location"
              placeholder="Chicago, IL"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />

            <SelectField
              label="Your Experience Level"
              value={experienceLevel}
              onChange={setExperienceLevel}
              options={experienceOptions}
            />

            <Input
              label="Current Salary or Offer"
              placeholder="$65,000"
              value={currentSalary}
              onChange={(e) => setCurrentSalary(e.target.value)}
            />
            <Input
              label="Your Target Salary"
              placeholder="$78,000"
              value={targetSalary}
              onChange={(e) => setTargetSalary(e.target.value)}
              required
            />

            <SelectField
              label="Specialty"
              value={specialty}
              onChange={setSpecialty}
              options={specialtyOptions}
            />

            {error && (
              <p className="rounded-card border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}

            <Button type="submit" loading={loading} className="w-full">
              Generate My Script
            </Button>
          </form>
        </Card>

        {script && (
          <section className="mx-auto max-w-4xl space-y-4">
            {outputCards.map((card) => (
              <Card
                key={card.key}
                className={cn('border-l-4', card.borderColor)}
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-text-primary">
                      {card.title}
                    </h3>
                    <p className="mt-1 text-sm text-text-secondary">
                      {card.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copySection(card.key)}
                    className="inline-flex items-center gap-2 rounded-pill border border-input-border px-3 py-2 text-sm font-semibold text-text-secondary transition-colors hover:border-primary/60 hover:text-primary"
                  >
                    <Copy className="h-4 w-4" />
                    {copiedKey === card.key ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="leading-7 text-text-primary">{script[card.key]}</p>
              </Card>
            ))}

            <Button className="w-full" size="lg" onClick={openPractice}>
              Practice This Script
            </Button>
          </section>
        )}
      </div>

      {practiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-card border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-card bg-primary/10 text-primary">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-text-primary">
                    Recruiter Practice
                  </h2>
                  <p className="text-sm text-text-secondary">
                    Practice responding in real time.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPracticeOpen(false)}
                className="rounded-full p-2 text-text-secondary transition-colors hover:bg-input hover:text-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[420px] space-y-4 overflow-y-auto p-5">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={cn(
                    'rounded-card border p-4 text-sm leading-6',
                    message.role === 'user'
                      ? 'ml-auto max-w-[80%] border-primary/30 bg-primary/10 text-text-primary'
                      : 'mr-auto max-w-[80%] border-border bg-input text-text-secondary'
                  )}
                >
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
                    {message.role === 'user' ? (
                      <MessageSquare className="h-3.5 w-3.5" />
                    ) : (
                      <Bot className="h-3.5 w-3.5" />
                    )}
                    {message.role === 'user' ? 'You' : 'Recruiter'}
                  </div>
                  {message.text}
                </div>
              ))}
            </div>

            <div className="flex gap-3 border-t border-border p-5">
              <input
                value={practiceInput}
                onChange={(e) => setPracticeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendPracticeMessage();
                }}
                placeholder="Type your response..."
                className="min-w-0 flex-1 rounded-pill border border-input-border bg-input px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <Button type="button" onClick={sendPracticeMessage}>
                <Send className="h-4 w-4" />
                Send
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-card border border-input-border bg-input px-4 py-3 text-text-primary transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-input text-text-primary">
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
