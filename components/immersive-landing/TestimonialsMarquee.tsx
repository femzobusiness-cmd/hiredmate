'use client';

const TESTIMONIALS = [
  {
    quote:
      "The Tough mode is genuinely brutal. It wouldn't let me get away with vague answers. Felt like a real interview.",
    name: 'Jessica T.',
    role: 'ICU RN',
    initials: 'JT',
  },
  {
    quote:
      'The Mayo Clinic pack had questions I actually got asked. Culture brief was perfect.',
    name: 'Marcus D.',
    role: 'New Grad RN',
    initials: 'MD',
  },
  {
    quote:
      "Said 'um' 14 times in my first recording. Down to 2 by my third. The tracker is brutal and I love it.",
    name: 'Priya K.',
    role: 'Travel Nurse',
    initials: 'PK',
  },
  {
    quote:
      'Battle Mode is addictive. I do it every morning before my shift now.',
    name: 'Keisha W.',
    role: 'ED Nurse',
    initials: 'KW',
  },
  {
    quote:
      'Went from failing practice interviews to landing my dream ICU job at Northwestern.',
    name: 'Sarah M.',
    role: 'ICU RN',
    initials: 'SM',
  },
  {
    quote:
      'The AI actually pushes back. Not like other apps that just accept any answer.',
    name: 'David L.',
    role: 'Med-Surg RN',
    initials: 'DL',
  },
];

function Card({ t }: { t: (typeof TESTIMONIALS)[0] }) {
  return (
    <div className="min-w-[280px] flex-shrink-0 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <div className="text-[#F59E0B]">★★★★★</div>
      <p className="mt-3 text-sm italic leading-relaxed text-white/75">
        &ldquo;{t.quote}&rdquo;
      </p>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-500/40 text-xs font-bold text-white">
          {t.initials}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{t.name}</p>
          <p className="text-xs text-white/40">{t.role}</p>
        </div>
      </div>
    </div>
  );
}

export function TestimonialsMarquee() {
  const row1 = [...TESTIMONIALS, ...TESTIMONIALS];
  const row2 = [...TESTIMONIALS.slice().reverse(), ...TESTIMONIALS.slice().reverse()];

  return (
    <section className="overflow-hidden py-24">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
        <h2
          className="text-4xl font-black text-white sm:text-5xl"
          style={{ fontFamily: "'Fredoka One', cursive" }}
        >
          Loved by nurses 🩺
        </h2>
        <p className="mt-3 text-white/50">Join thousands preparing smarter every day.</p>
      </div>

      <div className="mt-14 space-y-6">
        <div className="marquee-pause flex overflow-hidden">
          <div className="marquee-left flex gap-5 pr-5">
            {row1.map((t, i) => (
              <Card key={`r1-${i}`} t={t} />
            ))}
          </div>
        </div>
        <div className="marquee-pause flex overflow-hidden">
          <div className="marquee-right flex gap-5 pr-5">
            {row2.map((t, i) => (
              <Card key={`r2-${i}`} t={t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
