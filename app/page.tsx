'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import {
  Building2,
  Check,
  ChevronDown,
  FileText,
  Flame,
  Globe,
  Menu,
  Mic,
  Trophy,
  Volume2,
  X,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

const FREDOKA = { fontFamily: "'Fredoka One', cursive" } as const;

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#hospitals', label: 'Hospitals' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#how-it-works', label: 'How it works' },
];

const NURSE_TYPES = [
  'ICU nurses 🏥',
  'Travel nurses ✈️',
  'New grads 🎓',
  'ED nurses 🚨',
];

const STATS = [
  { value: '10,000+', label: 'Nurses Practicing' },
  { value: '5', label: 'Hospital Prep Packs' },
  { value: '3', label: 'Interview Modes' },
  { value: '15', label: 'Nurse Ranks' },
];

const HOSPITALS = [
  { emoji: '🏥', name: 'Mayo Clinic', loc: 'Rochester, MN', type: 'Academic', insight: 'Patient-first culture — STAR stories on advocacy.', color: '#003DA5', glow: '0 0 30px rgba(0,61,165,0.4)' },
  { emoji: '🫀', name: 'Cleveland Clinic', loc: 'Cleveland, OH', type: 'Academic', insight: 'Team-based care — interdisciplinary examples win.', color: '#0A4C8B', glow: '0 0 30px rgba(10,76,139,0.4)' },
  { emoji: '🟣', name: 'Northwestern', loc: 'Chicago, IL', type: 'Academic', insight: 'Evidence-based practice talking points matter.', color: '#4E2A84', glow: '0 0 30px rgba(78,42,132,0.4)' },
  { emoji: '🏨', name: 'HCA Healthcare', loc: 'Nashville, TN', type: 'For-Profit', insight: 'High-volume — efficiency and safety metrics.', color: '#C62828', glow: '0 0 30px rgba(198,40,40,0.4)' },
  { emoji: '💙', name: 'Kaiser', loc: 'Oakland, CA', type: 'Integrated', insight: 'Prevention and continuity of care are core.', color: '#005B8E', glow: '0 0 30px rgba(0,91,142,0.4)' },
];

const TESTIMONIALS = [
  { quote: "The Tough mode is genuinely brutal. It wouldn't let me get away with vague answers.", name: 'Jessica T.', role: 'ICU RN', initials: 'JT', bg: 'bg-purple-500/50' },
  { quote: 'The Mayo Clinic pack had questions I actually got asked. Culture brief was perfect.', name: 'Marcus D.', role: 'New Grad RN', initials: 'MD', bg: 'bg-teal-500/50' },
  { quote: "Said 'um' 14 times in my first recording. Down to 2 by my third.", name: 'Priya K.', role: 'Travel Nurse', initials: 'PK', bg: 'bg-amber-500/50' },
  { quote: 'Battle Mode is addictive. I do it every morning before my shift now.', name: 'Keisha W.', role: 'ED Nurse', initials: 'KW', bg: 'bg-red-500/50' },
  { quote: 'Went from failing practice interviews to landing my dream ICU job at Northwestern.', name: 'Sarah M.', role: 'ICU RN', initials: 'SM', bg: 'bg-indigo-500/50' },
  { quote: 'The AI actually pushes back. Not like other apps that just accept any answer.', name: 'David L.', role: 'Med-Surg RN', initials: 'DL', bg: 'bg-blue-500/50' },
  { quote: 'The hospital prep packs are so specific — I knew exactly what to expect at Kaiser.', name: 'Amara J.', role: 'New Grad RN', initials: 'AJ', bg: 'bg-cyan-500/50' },
  { quote: 'I did Battle Mode every day for 2 weeks. My clinical thinking got sharper.', name: 'Tyrone B.', role: 'ICU Nurse', initials: 'TB', bg: 'bg-orange-500/50' },
];

const FAQS = [
  { q: 'Is HiredMate free?', a: 'Yes — all features are free during our beta. No credit card required.' },
  { q: 'Is this only for new grads?', a: 'No. HiredMate works for new grads, experienced RNs, travel nurses, and every specialty.' },
  { q: 'How is this different from Googling questions?', a: 'You actually answer out loud and get pushed back on weak responses — not just read prompts.' },
  { q: 'Does the AI really push back?', a: 'Yes, especially in Tough mode. It asks follow-ups until you give a real STAR example.' },
  { q: 'What hospitals are covered?', a: 'Mayo, Cleveland, Northwestern, HCA, and Kaiser — with more packs coming soon.' },
  { q: 'Does it work on mobile?', a: 'Yes. HiredMate is fully responsive and works great on phones and tablets.' },
];

function MagneticButton({
  children,
  href,
  className = '',
  size = 'sm',
  pulse = false,
}: {
  children: ReactNode;
  href: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 400, damping: 25 });
  const sy = useSpring(y, { stiffness: 400, damping: 25 });

  const pad = size === 'lg' ? 'px-12 py-5 text-lg' : size === 'md' ? 'px-8 py-4 text-base' : 'px-6 py-2.5 text-sm';

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.3);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.3);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className="inline-block"
    >
      <Link href={href}>
        <motion.span
          style={{ x: sx, y: sy }}
          className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br from-[#7C5CBF] via-[#8B6DD4] to-[#A78BFA] font-semibold text-white shadow-[0_0_20px_rgba(124,92,191,0.5)] transition-shadow hover:shadow-[0_0_40px_rgba(124,92,191,0.8)] ${pad} ${pulse ? 'pulse-ring-cta' : ''} ${className}`}
        >
          {children}
        </motion.span>
      </Link>
    </motion.div>
  );
}

function BrandLogo({ size = 36 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <Image src="/hiredmate-logo.png" alt="HiredMate" width={size} height={size} className="rounded-2xl" priority />
      <span style={FREDOKA} className="text-xl">
        <span className="font-bold text-white">Hired</span>
        <span className="ml-1 rounded-xl bg-[#7C5CBF] px-2 py-0.5 text-lg text-white">Mate</span>
      </span>
    </div>
  );
}

function CountUpStat({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState('0');
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || started.current) return;
        started.current = true;
        const m = value.match(/^([^0-9]*)([\d,.]+)(.*)$/);
        if (!m) {
          setDisplay(value);
          return;
        }
        const target = parseFloat(m[2].replace(/,/g, ''));
        const pre = m[1];
        const suf = m[3];
        const t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - t0) / 1500, 1);
          const n = Math.round(target * (1 - Math.pow(1 - p, 3)));
          setDisplay(`${pre}${target >= 1000 ? n.toLocaleString() : n}${suf}`);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-center">
      <p className="text-4xl font-black text-white md:text-5xl">{display}</p>
      <p className="mt-1 text-sm font-medium text-white/35">{label}</p>
    </div>
  );
}

function HeroDemoCard({
  mouseX,
  mouseY,
}: {
  mouseX: ReturnType<typeof useMotionValue<number>>;
  mouseY: ReturnType<typeof useMotionValue<number>>;
}) {
  const [phase, setPhase] = useState(0);
  const [aiText, setAiText] = useState('');
  const [showTyping, setShowTyping] = useState(true);
  const [score, setScore] = useState(35);
  const [dims, setDims] = useState({ w: 1200, h: 800 });

  const AI1 =
    'Tell me about a time you had multiple patients with competing needs. How did you prioritize?';
  const AI2 =
    "That's too vague. I need a specific example — actual patient, what you did, and the outcome.";

  const rotateX = useTransform(mouseY, [0, dims.h], [8, -8]);
  const rotateY = useTransform(mouseX, [0, dims.w], [-8, 8]);
  const rx = useSpring(rotateX, { stiffness: 120, damping: 20 });
  const ry = useSpring(rotateY, { stiffness: 120, damping: 20 });

  useEffect(() => {
    const resize = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const type = (text: string, cb: () => void) => {
      setShowTyping(true);
      setAiText('');
      let i = 0;
      const iv = setInterval(() => {
        if (cancelled) return;
        i++;
        setAiText(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(iv);
          setShowTyping(false);
          cb();
        }
      }, 30);
      timers.push(iv as unknown as ReturnType<typeof setTimeout>);
    };

    const run = () => {
      setPhase(0);
      setScore(35);
      type(AI1, () => {
        timers.push(setTimeout(() => setPhase(2), 400));
        timers.push(
          setTimeout(() => {
            setPhase(3);
            setScore(20);
            type(AI2, () => {
              timers.push(
                setTimeout(() => {
                  setPhase(0);
                  setScore(35);
                  run();
                }, 2000)
              );
            });
          }, 2200)
        );
      });
    };

    run();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      timers.forEach(clearInterval);
    };
  }, []);

  return (
    <motion.div
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
      className="relative w-full max-w-lg will-change-transform"
    >
      <motion.div
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute inset-0 -z-10 rounded-3xl bg-purple-600/25 blur-3xl"
      />
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.07] bg-white/[0.04] px-5 py-3">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-400/70" />
            <span className="h-3 w-3 rounded-full bg-yellow-400/70" />
            <span className="h-3 w-3 rounded-full bg-green-400/70" />
          </div>
          <span className="text-xs font-medium text-white/50">Mock Interview • Neutral Mode 🧑‍💼</span>
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            LIVE
          </span>
        </div>
        <div className="min-h-[320px] p-5">
          <div className="mb-4 flex gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-700 text-xs text-white">
              JM
            </div>
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-white/10 bg-white/[0.08] px-4 py-3">
              {showTyping && phase === 0 && aiText.length === 0 ? (
                <div className="flex gap-1 py-1">
                  {[0, 1, 2].map((d) => (
                    <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-white/30" style={{ animationDelay: `${d * 0.15}s` }} />
                  ))}
                </div>
              ) : (
                <>
                  <p className="text-sm leading-relaxed text-white/80">{phase >= 3 ? AI2 : aiText || AI1}</p>
                  <p className="mt-1 text-[10px] text-white/25">08:21 PM</p>
                </>
              )}
            </div>
          </div>
          {phase >= 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="mb-4 flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-tr-sm border border-purple-500/30 bg-gradient-to-br from-purple-600/80 to-purple-800/80 px-4 py-3 text-sm text-white">
                I just assessed who needed help most and tried to stay calm...
              </div>
            </motion.div>
          )}
          {phase >= 3 && !showTyping && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-700 text-xs text-white">
                JM
              </div>
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-white/10 bg-white/[0.08] px-4 py-3 text-sm text-white/80">
                {aiText}
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 border-t border-white/[0.07] px-5 pb-5 pt-4">
          <div className="flex justify-between text-xs text-white/50">
            <span>Answer Quality</span>
            <span>{score}%</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-500"
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="mt-2 text-[11px] text-white/40">💡 Use STAR format — Situation, Task, Action, Result</p>
        </div>
      </div>
    </motion.div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] transition hover:border-white/[0.12]">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between px-6 py-5 text-left">
        <span className="text-base font-medium text-white">{q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown className="h-5 w-5 text-white/40" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <p className="px-6 pb-5 text-sm leading-relaxed text-white/55">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AtsRing() {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [offset, setOffset] = useState(176);
  const c = 2 * Math.PI * 28;
  useEffect(() => {
    if (inView) setOffset(c * (1 - 0.87));
  }, [inView, c]);
  return (
    <div className="relative inline-flex">
      <svg ref={ref} width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
        <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        <circle cx="36" cy="36" r="28" fill="none" stroke="#34d399" strokeWidth="6" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xl font-black text-white">87</span>
    </div>
  );
}

function RankRing() {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true });
  const [pct, setPct] = useState(0);
  const r = 60;
  const c = 2 * Math.PI * r;
  useEffect(() => {
    if (!inView) return;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / 1400, 1);
      setPct(Math.round(73 * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView]);
  return (
    <svg ref={ref} width="200" height="200" className="mx-auto -rotate-90">
      <circle cx="100" cy="100" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
      <circle cx="100" cy="100" r={r} fill="none" stroke="url(#rg)" strokeWidth="6" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} />
      <defs>
        <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7C5CBF" />
          <stop offset="100%" stopColor="#00C6B2" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Home() {
  const router = useRouter();
  const [navScrolled, setNavScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [typeIdx, setTypeIdx] = useState(0);
  const [yearly, setYearly] = useState(false);
  const [battleSec, setBattleSec] = useState(28);
  const [hoverMock, setHoverMock] = useState(false);
  const [mockTyping, setMockTyping] = useState('');

  const mouseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 0);
  const mouseY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight / 2 : 0);
  const cursorX = useSpring(mouseX, { stiffness: 200, damping: 25 });
  const cursorY = useSpring(mouseY, { stiffness: 200, damping: 25 });
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const { scrollY } = useScroll();

  useEffect(() => {
    const client = createClientComponentClient();
    client.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/dashboard');
    });
  }, [router]);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.6,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    let id: number;
    const raf = (time: number) => {
      lenis.raf(time);
      id = requestAnimationFrame(raf);
    };
    id = requestAnimationFrame(raf);
    document.documentElement.classList.add('lenis', 'lenis-smooth');
    return () => {
      cancelAnimationFrame(id);
      lenis.destroy();
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
    };
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', h, { passive: true });
    return () => window.removeEventListener('mousemove', h);
  }, [mouseX, mouseY]);

  useEffect(() => {
    const unsub = scrollY.on('change', (v) => setNavScrolled(v > 20));
    return unsub;
  }, [scrollY]);

  useEffect(() => {
    const id = setInterval(() => setTypeIdx((i) => (i + 1) % NURSE_TYPES.length), 2500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setBattleSec((s) => (s <= 0 ? 30 : s - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!hoverMock) {
      setMockTyping('');
      return;
    }
    const msg = 'Give me a specific example...';
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setMockTyping(msg.slice(0, i));
      if (i >= msg.length) clearInterval(iv);
    }, 40);
    return () => clearInterval(iv);
  }, [hoverMock]);

  const hospitalRow = [...HOSPITALS, ...HOSPITALS];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#05000F] text-white selection:bg-purple-500/30">
      {/* Cursor */}
      <motion.div
        style={{ x: cursorX, y: cursorY, translateX: '-50%', translateY: '-50%' }}
        className="immersive-cursor pointer-events-none fixed left-0 top-0 z-[9999] hidden h-5 w-5 rounded-full border-2 border-purple-400/60 mix-blend-difference md:block"
      />
      <motion.div
        style={{
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
          background: 'radial-gradient(circle, rgba(124,92,191,0.06) 0%, transparent 70%)',
        }}
        className="pointer-events-none fixed left-0 top-0 z-0 hidden h-[600px] w-[600px] rounded-full md:block"
      />

      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#05000F]" aria-hidden>
        <div
          className="landing-orb-a absolute -right-[10%] -top-[15%] h-[800px] w-[800px] rounded-full blur-[1px]"
          style={{ background: 'radial-gradient(circle at center, rgba(109,40,217,0.45) 0%, rgba(76,29,149,0.2) 35%, transparent 65%)' }}
        />
        <div
          className="landing-orb-b absolute -bottom-[20%] -left-[15%] h-[700px] w-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle at center, rgba(0,198,178,0.3) 0%, rgba(0,150,135,0.1) 40%, transparent 65%)' }}
        />
        <div
          className="landing-orb-c absolute left-[20%] top-[35%] h-[400px] w-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle at center, rgba(244,114,182,0.18) 0%, transparent 60%)' }}
        />
        <div
          className="landing-orb-d absolute right-[25%] top-[60%] h-[250px] w-[250px] rounded-full"
          style={{ background: 'radial-gradient(circle at center, rgba(245,158,11,0.12) 0%, transparent 60%)' }}
        />
        <div className="landing-grid-80 absolute inset-0" />
      </div>

      {/* Navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 ${navScrolled ? 'border-b border-white/[0.06] bg-[#05000F]/85 backdrop-blur-2xl' : 'bg-transparent'}`}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
          <Link href="/"><BrandLogo /></Link>
          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="group relative text-sm text-white/55 transition-colors duration-200 hover:text-white">
                {l.label}
                <span className="absolute bottom-[-2px] left-0 h-px w-0 bg-purple-400 transition-all duration-200 group-hover:w-full" />
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <Link href="/login" className="rounded-full border border-white/[0.12] px-5 py-2 text-sm text-white/70 transition-all duration-200 hover:border-white/25 hover:bg-white/[0.04] hover:text-white">
              Login
            </Link>
            <MagneticButton href="/signup">Start Free →</MagneticButton>
          </div>
          <button type="button" className="text-white md:hidden" onClick={() => setMenuOpen(true)} aria-label="Menu">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-[#05000F]/95 backdrop-blur-2xl md:hidden">
            <motion.nav
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="flex h-full flex-col items-center justify-center gap-6"
            >
              <button type="button" className="absolute right-6 top-6 text-white" onClick={() => setMenuOpen(false)} aria-label="Close">
                <X className="h-6 w-6" />
              </button>
              {NAV_LINKS.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => setMenuOpen(false)}
                  className="text-2xl text-white/80"
                >
                  {l.label}
                </motion.a>
              ))}
              <Link href="/login" onClick={() => setMenuOpen(false)} className="text-lg text-white/70">Login</Link>
              <Link href="/signup" onClick={() => setMenuOpen(false)} className="rounded-full bg-gradient-to-br from-[#7C5CBF] to-[#A78BFA] px-8 py-3 font-semibold">
                Start Free →
              </Link>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <section className="relative flex min-h-screen items-center overflow-hidden pt-16">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-[15%] left-[2%] hidden rounded-2xl border border-white/[0.12] bg-white/[0.08] px-4 py-3 shadow-xl backdrop-blur-xl md:flex md:items-center md:gap-3"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F59E0B]/20 text-sm">🏆</span>
          <div>
            <p className="text-xs font-semibold text-white">Rank Up!</p>
            <p className="text-xs text-white/60">Charge Nurse achieved</p>
          </div>
          <span className="rounded-full bg-[#F59E0B] px-2 py-0.5 text-xs font-black text-black">+150 XP</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: [0, -6, 0] }}
          transition={{ opacity: { delay: 1.5, duration: 0.6 }, y: { duration: 3.5, repeat: Infinity, delay: 0.5 } }}
          className="absolute right-[2%] top-[25%] hidden rounded-2xl border border-white/[0.12] bg-white/[0.08] px-4 py-3 backdrop-blur-xl md:block"
        >
          <p className="text-xs font-semibold text-white">🎯 Mayo Clinic Pack</p>
          <p className="text-xs text-teal-400">Score: 97% ⭐⭐⭐</p>
        </motion.div>

        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 py-20 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -60 }} animate={{ opacity: 1, x: 0 }} transition={{ type: 'spring', duration: 0.9 }}>
            <div className="landing-shimmer-badge relative mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.06] px-4 py-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="text-xs font-medium text-white/65">✦ Free for nurses — no card needed</span>
            </div>
            <h1 style={FREDOKA} className="text-[44px] leading-[1.05] tracking-tight md:text-[80px]">
              <span className="text-white">Land Your</span>
              <br />
              <span className="landing-gradient-text">Dream Nursing</span>
              <br />
              <span className="text-white">Job.</span>
            </h1>
            <p className="mt-4 max-w-[440px] text-lg leading-relaxed text-white/55">
              Practice with an AI hiring manager that actually challenges you. Master hospital-specific interviews. Get hired.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-white/30">Trusted by:</span>
              <AnimatePresence mode="wait">
                <motion.span key={typeIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-sm text-purple-300/80">
                  {NURSE_TYPES[typeIdx]}
                </motion.span>
              </AnimatePresence>
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <MagneticButton href="/signup" size="md" pulse className="!from-[#6D28D9] !via-[#7C5CBF] !to-[#A78BFA] !font-bold shadow-[0_8px_32px_rgba(109,40,217,0.45)]">
                Start Free — No Card Required →
              </MagneticButton>
              <motion.a href="#features" whileHover={{ scale: 1.02 }} className="inline-flex min-h-[44px] items-center rounded-full border border-white/[0.15] px-8 py-4 text-base text-white/75 hover:border-white/25 hover:bg-white/[0.04] hover:text-white">
                Watch Demo ▶
              </motion.a>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {['✓ Free forever', '✓ No credit card', '✓ Built for nurses'].map((t) => (
                <span key={t} className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs text-white/40">{t}</span>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ type: 'spring', duration: 0.9, delay: 0.3 }} className="flex justify-center lg:justify-end">
            <HeroDemoCard mouseX={mouseX} mouseY={mouseY} />
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative border-y border-white/[0.06] py-16" style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.03), transparent)' }}>
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-8 px-6 md:gap-16">
          {STATS.map((s, i) => (
            <div key={s.label} className="flex items-center">
              <CountUpStat value={s.value} label={s.label} />
              {i < STATS.length - 1 && <div className="mx-8 hidden h-14 w-px bg-gradient-to-b from-transparent via-white/15 to-transparent md:block" />}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-32">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-20 text-center">
          <span className="inline-flex rounded-full border border-purple-500/25 bg-purple-500/15 px-4 py-2 text-xs font-bold tracking-widest text-purple-300">✦ FEATURES</span>
          <h2 style={FREDOKA} className="mt-4 text-5xl text-white md:text-6xl">Everything you need</h2>
          <h2 style={FREDOKA} className="landing-gradient-text text-5xl md:text-6xl">to get hired.</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/45">Mock interviews, voice analysis, hospital packs, and battle mode.</p>
        </motion.div>
        <div className="grid auto-rows-auto grid-cols-12 gap-4">
          <motion.article
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onMouseEnter={() => setHoverMock(true)}
            onMouseLeave={() => setHoverMock(false)}
            className="group relative col-span-12 min-h-[280px] overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.04] p-8 transition-all duration-500 hover:border-white/[0.16] hover:bg-white/[0.06] md:col-span-7 md:row-span-2"
          >
            <div className="pointer-events-none absolute inset-0 rounded-3xl bg-purple-600/0 opacity-0 transition-opacity group-hover:bg-purple-600/[0.08] group-hover:opacity-100" />
            <div className="relative">
              <div className="mb-6 inline-flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 shadow-[0_0_20px_rgba(124,92,191,0.6)] transition group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(124,92,191,0.9)]">
                  <Mic className="h-6 w-6 text-white" />
                </div>
                <span className="rounded-full border border-[#F59E0B]/25 bg-[#F59E0B]/15 px-3 py-1 text-xs font-bold text-[#F59E0B]">Most Popular ✨</span>
              </div>
              <h3 className="text-2xl font-bold text-white">AI Mock Interviewer</h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/50">
                Practice with Dr. Sarah Chen, Mr. James Mitchell, or Director Karen Walsh. The AI pushes back on weak answers.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {['😊 Friendly', '🧑‍💼 Neutral', '😤 Tough'].map((b, i) => (
                  <span key={b} className={`rounded-full border px-3 py-1 text-xs ${i === 0 ? 'border-teal-500/20 bg-teal-500/10 text-teal-400' : i === 1 ? 'border-purple-500/20 bg-purple-500/10 text-purple-400' : 'border-red-500/20 bg-red-500/10 text-red-400'}`}>{b}</span>
                ))}
              </div>
              <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.04] p-4">
                <p className="text-xs text-white/60" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{mockTyping || 'Waiting for your answer...'}</p>
              </div>
            </div>
          </motion.article>
          <motion.article initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 }} className="group relative col-span-12 min-h-[200px] overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.04] p-7 md:col-span-5">
            <div className="pointer-events-none absolute inset-0 rounded-3xl bg-teal-600/0 opacity-0 transition group-hover:bg-teal-600/[0.06] group-hover:opacity-100" />
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-[0_0_20px_rgba(0,198,178,0.5)]"><Volume2 className="h-6 w-6 text-white" /></div>
            <h3 className="mt-4 text-xl font-bold text-white">Voice Practice</h3>
            <p className="mt-2 text-sm text-white/50">Filler words, WPM, clinical accuracy.</p>
            <div className="mt-4 flex h-12 items-end gap-1">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="landing-wave-bar w-2 rounded-full bg-gradient-to-t from-teal-600 to-teal-400" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </motion.article>
          <motion.article initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="group relative col-span-12 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.04] p-7 md:col-span-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_0_20px_rgba(99,102,241,0.5)]"><Building2 className="h-6 w-6 text-white" /></div>
            <h3 className="mt-4 text-xl font-bold text-white">Hospital Prep Packs</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {['🏥 Mayo', '🫀 Cleveland', '🟣 Northwestern', '🏨 HCA', '💙 Kaiser'].map((p) => (
                <span key={p} className="rounded-full border border-blue-500/20 bg-blue-900/40 px-3 py-1 text-xs text-blue-300 transition hover:scale-105">{p}</span>
              ))}
            </div>
          </motion.article>
          <motion.article initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }} className="group relative col-span-12 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.04] p-8 md:col-span-7 hover:shadow-[0_0_40px_rgba(239,68,68,0.2)]">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 shadow-[0_0_25px_rgba(239,68,68,0.6)]"><Zap className="h-6 w-6 text-white" /></div>
            <h3 className="mt-4 text-xl font-bold text-white">⚡ Battle Mode</h3>
            <p className="text-sm text-white/50">30 seconds. Escalating difficulty. Can you survive?</p>
            <p className={`mt-4 font-mono text-4xl font-black ${battleSec < 10 ? 'animate-pulse text-red-500' : 'text-red-400'}`}>0:{String(battleSec).padStart(2, '0')}</p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-gradient-to-r from-red-600 to-orange-500 transition-all duration-1000" style={{ width: `${(battleSec / 30) * 100}%` }} />
            </div>
            <p className="mt-3 animate-bounce rounded-xl border border-red-500/30 bg-red-900/30 px-3 py-2 text-xs text-red-400">⚠️ Your patient&apos;s monitor alarms!</p>
          </motion.article>
          <motion.article initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="col-span-12 rounded-3xl border border-white/[0.08] bg-white/[0.04] p-7 md:col-span-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-emerald-500/40"><FileText className="h-6 w-6 text-white" /></div>
            <h3 className="mt-4 text-xl font-bold text-white">Resume Builder</h3>
            <div className="relative mt-4 flex justify-center">
              <AtsRing />
              <span className="absolute inset-0 flex flex-col items-center justify-center pt-1 text-[10px] text-white/40">ATS Score</span>
            </div>
          </motion.article>
          <motion.article initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.25 }} className="col-span-12 rounded-3xl border border-white/[0.08] bg-white/[0.04] p-7 md:col-span-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 shadow-amber-500/40"><Trophy className="h-6 w-6 text-white" /></div>
            <h3 className="mt-4 text-xl font-bold text-white">Community</h3>
            <div className="mt-4 space-y-2">
              {[{ m: '👑', i: 'F', n: 'Femi', x: '+294 XP', c: 'bg-purple-500' }, { m: '🥈', i: 'R', n: 'Racksmargiela', x: '+86 XP', c: 'bg-teal-500' }, { m: '🥉', i: 'F', n: 'Femzo', x: '+20 XP', c: 'bg-gray-500' }].map((r) => (
                <div key={r.n} className="flex items-center gap-3 text-xs">
                  <span>{r.m}</span>
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full font-bold text-white ${r.c}`}>{r.i}</span>
                  <span className="flex-1 text-white/70">{r.n}</span>
                  <span className="font-bold text-amber-400">{r.x}</span>
                </div>
              ))}
            </div>
          </motion.article>
        </div>
      </section>

      {/* Hospitals */}
      <section id="hospitals" className="overflow-hidden py-28">
        <div className="mb-16 text-center">
          <span className="inline-flex rounded-full border border-teal-500/30 bg-teal-500/15 px-4 py-2 text-xs font-bold text-[#00C6B2]">✦ HOSPITAL PREP PACKS</span>
          <h2 style={FREDOKA} className="mt-4 text-5xl text-white">Practice for your exact hospital</h2>
          <p className="mt-3 text-white/45">Culture briefs, real questions, insider tips.</p>
        </div>
        <div className="landing-scroll-pause overflow-hidden">
          <div className="landing-scroll-left flex w-max gap-5 px-8">
            {hospitalRow.map((h, i) => (
              <article
                key={`${h.name}-${i}`}
                className="min-w-[280px] flex-shrink-0 rounded-3xl border border-white/[0.08] bg-white/[0.05] p-6 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-white/[0.18] hover:bg-white/[0.08]"
                style={{ boxShadow: h.glow }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = h.glow; }}
              >
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{h.emoji}</span>
                  <span className="h-2 w-2 rounded-full shadow-lg" style={{ background: h.color, boxShadow: `0 0 8px ${h.color}` }} />
                </div>
                <h3 className="mt-3 text-lg font-bold text-white">{h.name}</h3>
                <p className="mt-1 text-xs text-white/35">{h.loc}</p>
                <span className="mt-2 inline-block rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/50">{h.type}</span>
                <div className="my-3 border-t border-white/[0.08]" />
                <p className="text-sm italic text-white/55">{h.insight}</p>
                <Link href="/signup" className="mt-4 inline-block text-xs text-white/40 transition hover:text-white">View Pack →</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Gamification */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-28">
        <div className="text-center">
          <span className="inline-flex rounded-full border border-[#F59E0B]/30 bg-[#F59E0B]/15 px-4 py-2 text-xs font-bold text-[#F59E0B]">✦ GAMIFICATION</span>
          <h2 style={FREDOKA} className="mt-4 text-5xl text-white">Interview prep that feels like a game</h2>
        </div>
        <div className="mt-16 grid items-center gap-16 lg:grid-cols-2">
          <div className="space-y-4">
            {[
              { Icon: Flame, g: 'from-red-500 to-orange-600', t: 'Daily Streaks', d: "Build momentum. Don't break the chain." },
              { Icon: Zap, g: 'from-amber-400 to-yellow-600', t: 'XP System', d: 'Every answer earns points. Every session levels you up.' },
              { Icon: Trophy, g: 'from-purple-500 to-purple-700', t: '15 Nurse Ranks', d: 'Nursing Student → CNO. Your rank shows your growth.' },
              { Icon: Globe, g: 'from-teal-500 to-cyan-600', t: '5 Worlds, 26 Stages', d: 'From Fundamentals to Leadership.' },
            ].map((row, i) => (
              <motion.div key={row.t} initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${row.g}`}><row.Icon className="h-5 w-5 text-white" /></div>
                <div><p className="font-semibold text-white">{row.t}</p><p className="text-sm text-white/50">{row.d}</p></div>
              </motion.div>
            ))}
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="rounded-3xl border border-white/[0.08] bg-white/[0.05] p-8 text-center">
            <div className="relative">
              <RankRing />
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
                <span className="text-4xl">🏥</span>
                <p className="mt-2 font-bold text-white">Charge Nurse</p>
                <p className="text-sm text-white/40">Rank 9 of 15</p>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex justify-between text-sm text-white/50"><span>294 XP</span><span>500 XP</span></div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div initial={{ width: 0 }} whileInView={{ width: '58.8%' }} viewport={{ once: true }} transition={{ duration: 1.2 }} className="h-full rounded-full bg-gradient-to-r from-purple-500 to-teal-400" />
              </div>
            </div>
            <div className="mt-6 flex justify-center gap-3">
              {['🎯', '⚡', '🔥'].map((e, i) => (
                <div key={e} className={`flex h-16 w-16 items-center justify-center rounded-2xl border text-2xl ${i === 0 ? 'border-amber-500/30 bg-gradient-to-br from-amber-400/20 to-amber-600/20' : i === 1 ? 'border-purple-500/30 bg-gradient-to-br from-purple-400/20 to-purple-600/20' : 'border-teal-500/30 bg-gradient-to-br from-teal-400/20 to-teal-600/20'}`}>{e}</div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Voice */}
      <section className="mx-auto max-w-5xl px-6 py-28 text-center">
        <span className="inline-flex rounded-full border border-teal-500/30 bg-teal-500/15 px-4 py-2 text-xs font-bold text-[#00C6B2]">✦ VOICE PRACTICE</span>
        <h2 style={FREDOKA} className="mt-4 text-5xl text-white">Hear yourself improve</h2>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto mt-16 max-w-2xl rounded-3xl border border-white/[0.08] bg-white/[0.05] p-10">
          <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 3, repeat: Infinity }} className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-3xl shadow-[0_0_40px_rgba(0,198,178,0.4)]">🎙️</motion.div>
          <div className="mt-6 flex h-16 items-center justify-center gap-1.5">
            {Array.from({ length: 11 }).map((_, i) => (
              <div key={i} className="landing-wave-y w-2 rounded-full bg-gradient-to-t from-teal-600 to-teal-300" style={{ animationDuration: `${0.4 + (i % 5) * 0.08}s`, animationDelay: `${i * 0.05}s` }} />
            ))}
          </div>
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4"><p className="text-3xl font-black text-emerald-400">2</p><p className="text-xs text-white/45">Filler Words</p></div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4"><p className="text-3xl font-black text-purple-400">138</p><p className="text-xs text-white/45">Words/Min</p><p className="text-xs text-emerald-400">Just Right ✓</p></div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4"><p className="text-3xl font-black text-teal-400">84%</p><p className="text-xs text-white/45">Confidence</p></div>
          </div>
          <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 text-left text-sm leading-relaxed text-white/65">
            <p className="mb-2 text-xs text-white/40">📝 Your Answer (Transcribed)</p>
            During my last shift I was caring for six patients when <span className="rounded bg-amber-500/25 px-1 text-amber-400">um</span> one patient&apos;s blood pressure dropped...
          </div>
        </motion.div>
      </section>

      {/* Testimonials */}
      <section className="overflow-hidden py-24">
        <h2 style={FREDOKA} className="text-center text-4xl text-white">Loved by nurses 🩺</h2>
        <div className="mt-12 flex flex-col gap-4">
          <div className="landing-scroll-pause overflow-hidden">
            <div className="landing-scroll-left flex w-max gap-4">
              {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                <div key={`a-${i}`} className="min-w-[300px] rounded-2xl border border-white/[0.08] bg-white/[0.05] p-5 backdrop-blur-sm">
                  <div className="text-sm text-amber-400">★★★★★</div>
                  <p className="mt-2 text-sm italic leading-relaxed text-white/70">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-4 flex items-center gap-3">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${t.bg}`}>{t.initials}</span>
                    <div><p className="text-xs font-semibold text-white/80">{t.name}</p><p className="text-xs text-white/40">{t.role}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="landing-scroll-pause overflow-hidden">
            <div className="landing-scroll-right flex w-max gap-4">
              {[...TESTIMONIALS].reverse().concat([...TESTIMONIALS].reverse()).map((t, i) => (
                <div key={`b-${i}`} className="min-w-[300px] rounded-2xl border border-white/[0.08] bg-white/[0.05] p-5 backdrop-blur-sm">
                  <div className="text-sm text-amber-400">★★★★★</div>
                  <p className="mt-2 text-sm italic leading-relaxed text-white/70">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-4 flex items-center gap-3">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${t.bg}`}>{t.initials}</span>
                    <div><p className="text-xs font-semibold text-white/80">{t.name}</p><p className="text-xs text-white/40">{t.role}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-28">
        <div className="text-center">
          <span className="inline-flex rounded-full border border-[#F59E0B]/30 bg-[#F59E0B]/15 px-4 py-2 text-xs font-bold text-[#F59E0B]">✦ PRICING</span>
          <h2 style={FREDOKA} className="mt-4 text-5xl text-white">Start free. Upgrade when ready.</h2>
        </div>
        <div className="mt-8 flex items-center justify-center gap-3">
          <span className={`text-sm ${!yearly ? 'text-white' : 'text-white/60'}`}>Monthly</span>
          <button type="button" onClick={() => setYearly((y) => !y)} className="relative h-6 w-12 rounded-full bg-purple-600">
            <motion.span layout className={`absolute top-0.5 h-5 w-5 rounded-full bg-white ${yearly ? 'left-6' : 'left-0.5'}`} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
          </button>
          <span className={`text-sm ${yearly ? 'text-white' : 'text-white/60'}`}>Yearly</span>
          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">Save 40%</span>
        </div>
        <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-8">
            <p style={FREDOKA} className="text-2xl font-black text-white">Free</p>
            <p className="mt-2 text-6xl font-black text-white">$0<span className="text-lg font-normal text-white/40">/month</span></p>
            <div className="mb-6 mt-4 h-px w-12 bg-gradient-to-r from-teal-500 to-transparent" />
            <ul className="space-y-3">{['AI Mock Interview (3/day)', 'Voice Practice (5/day)', '2 Hospital Prep Packs', 'Stage-Based Learning', 'Community Leaderboard'].map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-white/65"><Check className="h-4 w-4 text-teal-400" />{f}</li>
            ))}</ul>
            <Link href="/signup" className="mt-8 block w-full rounded-2xl border border-white/[0.15] py-3.5 text-center font-semibold text-white transition hover:bg-white/[0.05]">Start Free →</Link>
          </div>
          <div className="relative">
            <span className="absolute -top-3 right-6 z-10 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-4 py-1.5 text-xs font-black text-black shadow-lg">Best Value</span>
            <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-900/60 via-purple-800/40 to-indigo-900/60 p-8 shadow-[0_0_60px_rgba(109,40,217,0.25)]">
              <p style={FREDOKA} className="text-2xl font-black text-white">Pro</p>
              <motion.p key={yearly ? 'y' : 'm'} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-2 text-6xl font-black text-white">
                {yearly ? '$7.99' : '$12'}<span className="text-lg font-normal text-white/40">/mo</span>
              </motion.p>
              <ul className="mt-6 space-y-3 text-sm text-white/80">
                {['Everything in Free', 'Unlimited Mock Interviews', 'All 5 Hospital Packs', 'Battle Mode', 'Resume Builder + PDF'].map((f) => (
                  <li key={f} className="flex gap-3"><Check className="h-4 w-4 text-purple-300" />{f}</li>
                ))}
              </ul>
              <Link href="/signup" className="mt-8 block w-full rounded-2xl bg-gradient-to-r from-purple-600 to-purple-400 py-3.5 text-center font-bold text-white hover:shadow-lg hover:shadow-purple-500/30">Get Pro →</Link>
            </div>
          </div>
        </div>
        <p className="mt-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-6 py-3 text-sm text-white/55">🎉 All features free during beta — no credit card needed</span>
        </p>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-2xl px-6 py-24">
        <h2 style={FREDOKA} className="text-center text-4xl text-white">Frequently asked questions</h2>
        <div className="mt-12 space-y-2">{FAQS.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}</div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden py-44">
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(109,40,217,0.35) 0%, transparent 65%), radial-gradient(ellipse 40% 40% at 30% 70%, rgba(0,198,178,0.2) 0%, transparent 60%)' }} />
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="absolute h-1 w-1 rounded-full"
            style={{
              left: `${(i * 17 + 5) % 100}%`,
              top: `${(i * 23 + 8) % 100}%`,
              background: i % 3 === 0 ? 'rgba(255,255,255,0.2)' : i % 3 === 1 ? 'rgba(124,92,191,0.3)' : 'rgba(0,198,178,0.25)',
              animation: `particle-float ${4 + (i % 7)}s ease-in-out infinite`,
              animationDelay: `${(i % 5) * 0.4}s`,
            }}
          />
        ))}
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h2 style={FREDOKA} className="text-[56px] leading-tight text-white md:text-[72px]">Your dream job is</h2>
          <h2 style={FREDOKA} className="landing-gradient-text text-[56px] md:text-[72px]">one interview away.</h2>
          <p className="mx-auto mt-6 max-w-lg text-xl leading-relaxed text-white/50">Start free. No credit card. Built specifically for nurses.</p>
          <div className="mt-12 flex justify-center">
            <MagneticButton
              href="/signup"
              size="lg"
              pulse
              className="!bg-gradient-to-r !from-[#7C5CBF] !via-[#8B5CF6] !to-[#00C6B2] shadow-[0_0_40px_rgba(124,92,191,0.5),0_0_80px_rgba(0,198,178,0.2)]"
            >
              Start Free Now →
            </MagneticButton>
          </div>
          <p className="mt-6 text-sm text-white/25">✓ Free · ✓ No card · ✓ Built for nurses</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/[0.06] px-6 py-20">
        <p style={FREDOKA} className="pointer-events-none absolute -top-4 left-1/2 -translate-x-1/2 select-none whitespace-nowrap text-[120px] text-white/[0.02]" aria-hidden>HiredMate</p>
        <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-12 md:grid-cols-4">
          <div>
            <BrandLogo />
            <p className="mt-3 text-sm leading-relaxed text-white/35">The #1 AI interview prep for nurses.</p>
            <div className="mt-6 flex gap-3">
              {['X', 'IG', 'TT'].map((s) => (
                <span key={s} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/10 text-xs text-white/40 transition hover:border-white/25 hover:bg-white/[0.05]">{s}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/30">Product</p>
            {['Dashboard', 'Mock Interview', 'Voice Practice', 'Hospitals', 'Battle Mode', 'Resume Builder'].map((l) => (
              <Link key={l} href={l === 'Dashboard' ? '/dashboard' : l.includes('Resume') ? '/resume-builder' : l === 'Battle Mode' ? '/battle' : '/practice'} className="block py-1 text-sm text-white/55 transition hover:text-white">{l}</Link>
            ))}
          </div>
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/30">Resources</p>
            <a href="#" className="block py-1 text-sm text-white/55 hover:text-white">Blog (coming soon)</a>
            <a href="#features" className="block py-1 text-sm text-white/55 hover:text-white">Interview Tips</a>
            <a href="#hospitals" className="block py-1 text-sm text-white/55 hover:text-white">Hospital Guides</a>
          </div>
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/30">Support</p>
            <a href="mailto:support@hiredmate.online" className="block py-1 text-sm text-white/55 hover:text-white">support@hiredmate.online</a>
            <Link href="/privacy" className="block py-1 text-sm text-white/55 hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="block py-1 text-sm text-white/55 hover:text-white">Terms</Link>
          </div>
        </div>
        <div className="relative mx-auto mt-16 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-white/[0.05] pt-8 md:flex-row">
          <span className="text-sm text-white/20">© 2026 HiredMate. All rights reserved.</span>
          <span className="text-sm text-white/20">
            <Link href="/privacy" className="hover:text-white/50">Privacy</Link> · <Link href="/terms" className="hover:text-white/50">Terms</Link> · <a href="mailto:support@hiredmate.online" className="hover:text-white/50">Contact</a>
          </span>
        </div>
      </footer>
    </div>
  );
}

