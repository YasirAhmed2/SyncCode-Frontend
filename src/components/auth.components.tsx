import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Code2, Zap, Users, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0B0F19' }}>

      {/* Left — Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2" style={{ position: 'relative', overflow: 'hidden', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 56px', background: '#0D1117', borderRight: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Subtle orbs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '20%', left: '20%', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', bottom: '20%', right: '15%', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)' }} />
          {/* Dot grid */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.025, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        </div>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', position: 'relative', zIndex: 1 }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}>
            <Code2 size={19} color="white" />
          </div>
          <span style={{ fontSize: '20px', fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.01em' }}>
            Sync<span style={{ color: '#818CF8' }}>Code</span>
          </span>
        </Link>

        {/* Hero copy */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: '16px' }}>
            Collaborate on code<br />
            <span style={{ color: '#818CF8' }}>in real-time</span>
          </h1>
          <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.7, maxWidth: '380px', marginBottom: '36px' }}>
            Join thousands of developers writing, executing, and discussing code together — all in one live coding room.
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { icon: <Zap size={14} />, text: 'Real-time sync under 50ms' },
              { icon: <Terminal size={14} />, text: 'Instant sandboxed code execution' },
              { icon: <Users size={14} />, text: 'Built-in team chat' },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.08 }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818CF8', flexShrink: 0 }}>
                  {f.icon}
                </div>
                <span style={{ color: 'rgba(241,245,249,0.65)' }}>{f.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '0' }}>
          {[
            { val: '10K+', label: 'Active Users' },
            { val: '50K+', label: 'Sessions' },
            { val: '99.9%', label: 'Uptime' },
          ].map((s, i) => (
            <div key={i} style={{ paddingLeft: i > 0 ? '28px' : 0, marginLeft: i > 0 ? '28px' : 0, borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#818CF8', letterSpacing: '-0.01em' }}>{s.val}</div>
              <div style={{ fontSize: '12px', color: '#4B5563', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — Form Panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} style={{ width: '100%', maxWidth: '420px', position: 'relative' }}>
          {/* Mobile Logo */}
          <Link to="/" className="lg:hidden" style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', textDecoration: 'none', marginBottom: '28px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Code2 size={16} color="white" />
            </div>
            <span style={{ fontSize: '17px', fontWeight: 700, color: '#f1f5f9' }}>Sync<span style={{ color: '#818CF8' }}>Code</span></span>
          </Link>

          {/* Card */}
          <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '32px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.01em', marginBottom: '4px' }}>{title}</h2>
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '28px' }}>{subtitle}</p>
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
