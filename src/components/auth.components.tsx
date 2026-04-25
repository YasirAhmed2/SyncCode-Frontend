import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Code2, Zap, Users, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from './theme-toggle';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-background">

      {/* Left — Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between px-14 py-12 bg-card border-r border-border/50">

        {/* Subtle orbs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '20%', left: '20%', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', bottom: '20%', right: '15%', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)' }} />
          {/* Dot grid */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.025, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        </div>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 relative z-10 no-underline">
          <div className="w-[38px] h-[38px] rounded-[10px] bg-primary flex items-center justify-center shadow-[0_4px_16px_rgba(99,102,241,0.3)]">
            <Code2 size={19} color="white" />
          </div>
          <span className="text-[20px] font-bold text-foreground tracking-[-0.01em]">
            Sync<span className="text-primary">Code</span>
          </span>
        </Link>

        {/* Hero copy */}
        <div className="relative z-10">
          <h1 className="text-[clamp(2rem,3.5vw,2.75rem)] font-extrabold text-foreground leading-[1.15] tracking-[-0.02em] mb-4">
            Collaborate on code<br />
            <span className="text-primary">in real-time</span>
          </h1>
          <p className="text-[15px] text-muted-foreground leading-[1.7] max-w-[380px] mb-9">
            Join thousands of developers writing, executing, and discussing code together — all in one live coding room.
          </p>

          {/* Feature pills */}
          <div className="flex flex-col gap-3">
            {[
              { icon: <Zap size={14} />, text: 'Real-time sync under 50ms' },
              { icon: <Terminal size={14} />, text: 'Instant sandboxed code execution' },
              { icon: <Users size={14} />, text: 'Built-in team chat' },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.08 }}
                className="flex items-center gap-2.5 text-[14px]"
              >
                <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  {f.icon}
                </div>
                <span className="text-muted-foreground">{f.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 flex items-center gap-0">
          {[
            { val: '10K+', label: 'Active Users' },
            { val: '50K+', label: 'Sessions' },
            { val: '99.9%', label: 'Uptime' },
          ].map((s, i) => (
            <div key={i} className={`pl-7 ml-7 ${i > 0 ? 'border-l border-border/50' : 'pl-0 ml-0 border-none'}`}>
              <div className="text-[22px] font-extrabold text-primary tracking-[-0.01em]">{s.val}</div>
              <div className="text-[12px] text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute top-6 right-6 z-50">
          <ThemeToggle />
        </div>
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.04)_0%,transparent_70%)] pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="w-full max-w-[420px] relative">
          {/* Mobile Logo */}
          <Link to="/" className="lg:hidden inline-flex items-center gap-2 mb-7 no-underline">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Code2 size={16} color="white" />
            </div>
            <span className="text-[17px] font-bold text-foreground">Sync<span className="text-primary">Code</span></span>
          </Link>

          {/* Card */}
          <div className="bg-card border border-border/70 rounded-[18px] p-8 shadow-[var(--shadow-card)]">
            <h2 className="text-[22px] font-extrabold text-foreground tracking-[-0.01em] mb-1">{title}</h2>
            <p className="text-[14px] text-muted-foreground mb-7">{subtitle}</p>
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
