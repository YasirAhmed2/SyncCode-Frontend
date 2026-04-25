import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CirclePlay,
  Code2,
  Eye,
  Github,
  GraduationCap,
  LaptopMinimalCheck,
  LayoutDashboard,
  LineChart,
  Linkedin,
  Lock,
  Menu,
  MonitorPlay,
  MoonStar,
  Radio,
  School,
  Sparkles,
  Users,
  Video,
  X,
} from 'lucide-react';
import { ThemeToggle } from '../components/theme-toggle';

const problemItems = [
  {
    icon: Eye,
    title: "Teachers can't track attention",
    description: 'No visibility into who is following along or falling behind.',
  },
  {
    icon: MonitorPlay,
    title: 'Students get lost in live coding',
    description: 'Fast-paced sessions leave struggling students stuck and silent.',
  },
  {
    icon: Video,
    title: 'No structured post-class review',
    description: 'Classes end with no clear analytics on what happened during learning.',
  },
  {
    icon: BarChart3,
    title: 'Engagement is pure guesswork',
    description: 'Educators lack real-time signals to intervene effectively.',
  },
] as const;

const solutionPairs = [
  {
    problem: 'Teachers lack real-time visibility.',
    solution: 'Live attention tracking surfaces active and idle learners instantly.',
  },
  {
    problem: 'Students get lost during fast-paced coding sessions.',
    solution: 'Teacher Controlled Mode switches between broadcast and practice effortlessly.',
  },
  {
    problem: 'No visibility after the session ends.',
    solution: 'Session reports make every class measurable and coachable.',
  },
] as const;

const featureBlocks = [
  {
    id: 'teacher-mode',
    eyebrow: 'Feature 01',
    title: 'Teacher Controlled Mode',
    description: 'Guide the room with broadcast mode or release students into guided practice.',
    bullets: ['Broadcast code changes live', 'Switch into guided practice', 'Lock or unlock student editing'],
  },
  {
    id: 'classroom-intelligence',
    eyebrow: 'Feature 02',
    title: 'Live Classroom Intelligence',
    description: 'Understand classroom momentum at a glance with student activity states.',
    bullets: ['Active, idle, and inactive states', 'Real-time room engagement view', 'See where intervention is needed'],
  },
  {
    id: 'session-intelligence',
    eyebrow: 'Feature 03',
    title: 'Session Intelligence',
    description: 'Review class insights and track learning progress over time.',
    bullets: ['Session-level class insights', 'Auto-generated engagement summaries', 'Progress tracking over time'],
  },
] as const;

const steps = [
  {
    title: 'Create or Join Room',
    description: 'Start a class space in seconds and bring everyone into the same coding room.',
  },
  {
    title: 'Teach or Collaborate Live',
    description: 'Move between teacher-led broadcast and student practice without breaking flow.',
  },
  {
    title: 'Track and Review Performance',
    description: 'Use live attention signals and post-session reports to improve each class.',
  },
] as const;

const useCases = [
  {
    icon: GraduationCap,
    title: 'Universities',
    description: 'Run practical labs with full visibility.',
  },
  {
    icon: LaptopMinimalCheck,
    title: 'Coding Bootcamps',
    description: 'Coach cohorts with engagement tracking.',
  },
  {
    icon: School,
    title: 'Schools',
    description: 'Lead interactive coding lessons efficiently.',
  },
  {
    icon: Users,
    title: 'Online Instructors',
    description: 'Deliver engaging remote sessions.',
  },
] as const;

const navItems = [
  { label: 'Problem', href: '#problem' },
  { label: 'Solution', href: '#solution' },
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

function LandingPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const { scrollYProgress, scrollY } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const yHeroText = useTransform(scrollY, [0, 500], [0, 100]);
  const opacityHeroText = useTransform(scrollY, [0, 300], [1, 0]);
  const yHeroMockup = useTransform(scrollY, [0, 500], [0, 50]);

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  const heroCode = useMemo(
    () => [
      { line: 1, text: 'room.mode = "broadcast"', accent: 'text-indigo-300' },
      { line: 2, text: 'teacher.lockEditing(true)', accent: 'text-slate-300' },
      { line: 3, text: 'attentionTracker.watch(students)', accent: 'text-blue-300' },
      { line: 4, text: 'session.record.start()', accent: 'text-slate-300' },
      { line: 5, text: 'report.generateAfterClass()', accent: 'text-indigo-300' },
    ],
    []
  );

  return (
    <div className="relative min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-background text-foreground">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-[100]"
        style={{ scaleX }}
      />

      {/* Ambient background mesh */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] h-[50%] w-[50%] rounded-full bg-primary/10 blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[20%] -right-[10%] h-[40%] w-[40%] rounded-full bg-indigo-500/10 blur-[120px]"
        />
      </div>

      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--shadow-primary)]">
              <Code2 className="h-5 w-5" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                SyncCode
              </div>
              <div className="text-sm text-foreground/80">Collaborative Coding Classroom</div>
            </div>
          </button>

          <nav className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Sign In
            </button>
            <button type="button" onClick={() => navigate('/register')} className="btn-primary gap-2 text-sm">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              aria-label="Toggle navigation"
              onClick={() => setMenuOpen((value) => !value)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card/70"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-border/70 bg-background/95 px-4 py-4 md:hidden">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                </a>
              ))}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="rounded-xl px-3 py-3 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="btn-primary mt-2 justify-center"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="relative z-10">
        <section className="px-4 pb-20 pt-28 sm:px-6 lg:px-8 lg:pb-28 lg:pt-36">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <motion.div
              style={{ y: yHeroText, opacity: opacityHeroText }}
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="max-w-2xl"
            >
              <motion.div variants={staggerItem} className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                Real-time Coding Classroom Platform
              </motion.div>

              <motion.h1 variants={staggerItem} className="max-w-4xl text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                Teach smarter. Code together.
              </motion.h1>

              <motion.p variants={staggerItem} className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                The live coding classroom where educators control the room, track student attention in real time, and review every session.
              </motion.p>

              <motion.div variants={staggerItem} className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={() => navigate('/register')} className="btn-primary gap-2 relative overflow-hidden group">
                  <span className="relative z-10 flex items-center gap-2">Start Coding <ArrowRight className="h-4 w-4" /></span>
                  <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-300 ease-in-out" />
                </button>
                <a href="#features" className="btn-secondary gap-2 hover:bg-muted transition-colors">
                  <CirclePlay className="h-4 w-4" />
                  Live Demo
                </a>
              </motion.div>

              <motion.div variants={staggerItem} className="mt-10 grid gap-4 sm:grid-cols-3">
                {[
                  ['Teacher Controlled', 'Broadcast, practice, lock editing'],
                  ['Live Attention Tracker', 'See active, idle, inactive learners'],
                  ['Session Intelligence', 'Review reports and class insights'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-border/70 bg-card/60 p-4 shadow-[var(--shadow-card)]">
                    <div className="text-sm font-semibold text-foreground">{label}</div>
                    <div className="mt-1 text-sm leading-6 text-muted-foreground">{value}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              style={{ y: yHeroMockup }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, type: "spring", bounce: 0.4 }}
              className="relative"
            >
              {/* Continuous floating wrapper */}
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="rounded-[28px] border border-border/70 bg-card/70 p-3 shadow-[var(--shadow-card-hover)] backdrop-blur"
              >
                <div className="grid gap-3 lg:grid-cols-[1.08fr_0.92fr]">
                  <div className="rounded-[22px] border border-border/70 bg-card p-4">
                    <div className="mb-4 flex items-center justify-between border-b border-border/50 pb-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-rose-400" />
                        <span className="h-3 w-3 rounded-full bg-amber-400" />
                        <span className="h-3 w-3 rounded-full bg-emerald-400" />
                      </div>
                      <span className="font-mono">teacher-room.tsx</span>
                      <div className="rounded-full bg-emerald-500/15 px-2 py-1 font-medium text-emerald-500">
                        Live class
                      </div>
                    </div>

                    <div className="space-y-3">
                      {heroCode.map((row) => (
                        <div key={row.line} className="grid grid-cols-[28px_1fr] items-start gap-3 text-sm">
                          <span className="font-mono text-muted-foreground/50">{row.line}</span>
                          <span className={`font-mono ${row.accent} break-all`}>{row.text}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 rounded-2xl border border-border/50 bg-background/50 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-[13px] font-semibold text-foreground">Teacher Mode</div>
                          <div className="mt-0.5 text-[10px] text-muted-foreground">Instructor broadcast active</div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-medium text-primary">
                          <Radio className="h-3 w-3" />
                          Live
                        </div>
                      </div>
                      <div className="mt-3 flex gap-1.5">
                        {[
                          ['Broadcast', true],
                          ['Practice', false],
                          ['Locked', true],
                        ].map(([label, active]) => (
                          <div
                            key={label}
                            className={`flex-1 rounded-lg border py-1.5 text-center text-[10px] font-medium ${active
                                ? 'border-primary/30 bg-primary/10 text-primary'
                                : 'border-border/50 bg-background/50 text-muted-foreground'
                              }`}
                          >
                            {label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-[22px] border border-border/70 bg-background/80 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold">Live Classroom Intelligence</div>
                          <div className="mt-1 text-xs text-muted-foreground">Attention tracker overview</div>
                        </div>
                        <div className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                          82% engaged
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        {[
                          ['Ayesha', 'Active', 'bg-emerald-500/15 text-emerald-400', 'Following live edits'],
                          ['Hamza', 'Idle', 'bg-amber-500/15 text-amber-400', 'No input for 2 min'],
                          ['Sara', 'Inactive', 'bg-rose-500/15 text-rose-400', 'Reconnect recommended'],
                        ].map(([name, state, stateClass, note]) => (
                          <motion.div
                            key={name}
                            whileHover={{ y: -2 }}
                            className="rounded-2xl border border-border/70 bg-card/80 p-3"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                                  {name.slice(0, 1)}
                                </div>
                                <div>
                                  <div className="text-sm font-semibold">{name}</div>
                                  <div className="text-xs text-muted-foreground">{note}</div>
                                </div>
                              </div>
                              <div className={`rounded-full px-2.5 py-1 text-xs font-medium ${stateClass}`}>{state}</div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[18px] border border-border/70 bg-card/70 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-[13px] font-semibold">Session Intel</div>
                        <div className="text-[10px] text-muted-foreground">Post-class</div>
                      </div>
                      <div className="mt-3 flex gap-1.5">
                        {[
                          ['Duration', '45m'],
                          ['Focus', '4'],
                          ['Gaps', '3'],
                        ].map(([label, value]) => (
                          <div key={label} className="flex-1 rounded-xl border border-border/70 bg-background/80 py-2 text-center">
                            <div className="text-sm font-bold leading-tight">{value}</div>
                            <div className="mt-0.5 text-[9px] text-muted-foreground">{label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section id="problem" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <div className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">The Problem</div>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                What's Broken in Coding Classrooms?
              </h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                Most live coding tools show the code — but not the classroom.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {problemItems.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: index * 0.1, type: "spring" }}
                  whileHover={{ y: -8, scale: 1.02, rotateX: 2, rotateY: -2 }}
                  className="glass-card glass-card-hover rounded-3xl p-6 transition-all"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="solution" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <div className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">The Solution</div>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                Built for Real Teaching Environments
              </h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                Every classroom pain point mapped to a practical solution.
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {solutionPairs.map((pair, index) => (
                <motion.div
                  key={pair.problem}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: index * 0.1, type: "spring", bounce: 0.4 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="rounded-3xl border border-border/70 bg-card/70 p-6 shadow-[var(--shadow-card)] transition-all"
                >
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Problem</div>
                  <p className="mt-3 text-base leading-7">{pair.problem}</p>
                  <div className="my-5 h-px bg-border" />
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">SyncCode Solution</div>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{pair.solution}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <div className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Core Features</div>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                Three pillars of classroom intelligence
              </h2>
            </div>

            <div className="mt-12 space-y-6">
              {featureBlocks.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="grid gap-6 rounded-[32px] border border-border/70 bg-card/70 p-6 shadow-[var(--shadow-card)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:p-8 overflow-hidden relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{feature.eyebrow}</div>
                    <h3 className="mt-3 text-2xl font-semibold tracking-[-0.02em]">{feature.title}</h3>
                    <p className="mt-4 text-base leading-8 text-muted-foreground">{feature.description}</p>
                    <div className="mt-6 space-y-3">
                      {feature.bullets.map((bullet) => (
                        <div key={bullet} className="flex items-start gap-3">
                          <CheckCircle2 className="mt-1 h-5 w-5 text-primary" />
                          <span className="text-sm leading-7 text-muted-foreground">{bullet}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <FeatureMock featureId={feature.id} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <div className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">How It Works</div>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                A simple classroom workflow in three steps
              </h2>
            </div>

            <div className="mt-14 space-y-8">
              {steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: index * 0.1, type: "spring", bounce: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  className="grid gap-4 rounded-3xl border border-border/70 bg-card/70 p-6 md:grid-cols-[72px_1fr] transition-all"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/12 text-lg font-semibold text-primary">
                    {index + 1}
                  </div>
                  <div className="relative">
                    {index < steps.length - 1 && (
                      <div className="absolute left-7 top-16 hidden h-12 w-px bg-border md:block" />
                    )}
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <div className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Use Cases</div>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                Built for Real Classrooms
              </h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                SyncCode is shaped for teaching environments where collaboration matters, structure matters, and learning visibility matters.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {useCases.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: index * 0.1, type: "spring" }}
                  whileHover={{ y: -8, scale: 1.05 }}
                  className="glass-card glass-card-hover rounded-3xl p-6 transition-all"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>


        <section className="px-4 pb-24 pt-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl rounded-[36px] border border-primary/20 bg-primary/10 px-6 py-12 text-center shadow-[var(--shadow-primary)] sm:px-10">
            <div className="mx-auto max-w-3xl">
              <div className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Get Started</div>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">
                Teach smarter. Code together.
              </h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                Everything you need for real-time coding classrooms — in one platform.
              </p>
              <div className="mt-8 flex justify-center">
                <button type="button" onClick={() => navigate('/register')} className="btn-primary gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/70 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-foreground">SyncCode</div>
            <div className="mt-1 text-sm text-muted-foreground">Professional collaborative coding for modern classrooms.</div>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/YasirAhmed2"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl border border-border/70 bg-card/70 px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/iamyasirahmed/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl border border-border/70 bg-card/70 px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureMock({ featureId }: { featureId: string }) {
  if (featureId === 'teacher-mode') {
    return (
      <motion.div whileHover={{ y: -3 }} className="rounded-[28px] border border-border/70 bg-background/70 p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Room Control</div>
            <div className="mt-1 text-xs text-muted-foreground">Manage what students can do</div>
          </div>
          <LayoutDashboard className="h-5 w-5 text-primary" />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            ['Broadcast', true, <Radio className="h-4 w-4" />],
            ['Practice', false, <BookOpen className="h-4 w-4" />],
            ['Lock Editing', true, <Lock className="h-4 w-4" />],
          ].map(([label, active, icon]) => (
            <div
              key={label as string}
              className={`rounded-3xl border p-4 ${active
                  ? 'border-primary/25 bg-primary/10 text-primary'
                  : 'border-border/70 bg-card/70 text-muted-foreground'
                }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{label}</span>
                {icon}
              </div>
              <div className="mt-6 h-2 rounded-full bg-background/60">
                <div className={`h-2 rounded-full ${active ? 'w-full bg-primary' : 'w-1/3 bg-border'}`} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (featureId === 'classroom-intelligence') {
    return (
      <motion.div whileHover={{ y: -3 }} className="rounded-[28px] border border-border/70 bg-background/70 p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Student Activity Panel</div>
            <div className="mt-1 text-xs text-muted-foreground">Intervene based on live signals</div>
          </div>
          <Users className="h-5 w-5 text-primary" />
        </div>

        <div className="mt-5 space-y-3">
          {[
            ['Ali', 'Active', 'Following teacher cursor', 'bg-emerald-500/15 text-emerald-400'],
            ['Noor', 'Idle', 'No edits in 90 seconds', 'bg-amber-500/15 text-amber-400'],
            ['Maha', 'Inactive', 'Disconnected from room activity', 'bg-rose-500/15 text-rose-400'],
          ].map(([name, state, note, tone]) => (
            <div key={name as string} className="rounded-3xl border border-border/70 bg-card/80 p-4">
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                    {(name as string).slice(0, 1)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{name}</div>
                    <div className="text-xs text-muted-foreground">{note}</div>
                  </div>
                </div>
                <div className={`rounded-full px-2.5 py-1 text-xs font-medium ${tone} self-start sm:self-auto`}>{state}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div whileHover={{ y: -3 }} className="rounded-[28px] border border-border/70 bg-background/70 p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Session Reports</div>
          <div className="mt-1 text-xs text-muted-foreground">Review the class after it ends</div>
        </div>
        <LineChart className="h-5 w-5 text-primary" />
      </div>

      <div className="mt-6 rounded-3xl border border-border/70 bg-card/70 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">Session Timeline</span>
          <span className="text-muted-foreground">Report ready</span>
        </div>

        <div className="mt-5 space-y-4">
          {[
            ['00:08', 'Lesson started'],
            ['11:20', 'Practice mode enabled'],
            ['24:18', 'Attention dip detected'],
            ['42:50', 'Report generated'],
          ].map(([time, label]) => (
            <div key={time as string} className="grid grid-cols-[56px_1fr] gap-3">
              <div className="text-xs font-medium text-primary">{time}</div>
              <div className="rounded-2xl border border-border/70 bg-background/70 px-3 py-2 text-sm text-muted-foreground">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default LandingPage;
