'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { Copy, DollarSign, MapPin, Target, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function SalaryPage() {
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [currentSalary, setCurrentSalary] = useState('');
  const [targetSalary, setTargetSalary] = useState('');
  const [generated, setGenerated] = useState(false);

  const script = useMemo(
    () => ({
      opening:
        `I am excited about the opportunity to contribute as ${role || 'a healthcare professional'} in ${location || 'this market'}. Based on the responsibilities of the role and my ${experience || 'clinical'} experience, I would like to discuss aligning the compensation with the value I can bring to the team.`,
      counter:
        `Given my background and the scope of this position, I am targeting ${targetSalary || 'a more competitive range'}. Is there flexibility to move closer to that number within the total compensation package?`,
      walkAway:
        `My current compensation is ${currentSalary || 'below my target'}, and my walk-away point would depend on benefits, shift differentials, growth opportunities, and schedule. I would be open to reviewing the full package together.`,
    }),
    [currentSalary, experience, location, role, targetSalary]
  );

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-card border border-border bg-card p-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
            Salary Prep
          </p>
          <h1 className="mt-3 text-4xl font-bold text-text-primary">Know Your Worth</h1>
          <p className="mt-3 text-lg leading-8 text-text-secondary">
            Build a polished negotiation script that protects your value without
            sounding adversarial.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <Card>
          <div className="mb-6 flex items-center gap-3">
            <DollarSign className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold text-text-primary">Compensation profile</h2>
          </div>
          <div className="space-y-4">
            <Input label="Role title" placeholder="ICU Registered Nurse" value={role} onChange={(e) => setRole(e.target.value)} />
            <Input label="Location" placeholder="Austin, TX" value={location} onChange={(e) => setLocation(e.target.value)} />
            <Input label="Years experience" placeholder="3 years" value={experience} onChange={(e) => setExperience(e.target.value)} />
            <Input label="Current salary" placeholder="$82,000" value={currentSalary} onChange={(e) => setCurrentSalary(e.target.value)} />
            <Input label="Target salary" placeholder="$94,000" value={targetSalary} onChange={(e) => setTargetSalary(e.target.value)} />
            <Button className="w-full" onClick={() => setGenerated(true)}>
              Generate My Script
            </Button>
          </div>
        </Card>

        <Card>
          <div className="mb-6 flex items-center gap-3">
            <Target className="h-6 w-6 text-secondary" />
            <h2 className="text-xl font-bold text-text-primary">Negotiation script</h2>
          </div>
          {generated ? (
            <div className="space-y-4">
              {[
                { title: 'Opening line', text: script.opening, icon: UserRound },
                { title: 'Counter offer', text: script.counter, icon: DollarSign },
                { title: 'Walk away number', text: script.walkAway, icon: MapPin },
              ].map((section) => (
                <div key={section.title} className="rounded-card border border-border bg-input p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <section.icon className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold text-text-primary">{section.title}</h3>
                    </div>
                    <button
                      className="text-text-muted transition-colors hover:text-primary"
                      onClick={() => navigator.clipboard?.writeText(section.text)}
                      type="button"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm leading-6 text-text-secondary">{section.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-card border border-dashed border-input-border bg-input p-8 text-center">
              <p className="text-text-secondary">
                Fill out your compensation profile to generate a negotiation script.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
