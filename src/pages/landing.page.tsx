import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, Zap, Code2, Users, Play, ArrowRight,
  BookOpen, Monitor, Briefcase, GraduationCap,
  MessageSquare, Terminal, Globe, Github,
  Star, Lightbulb, Rocket, Target
} from 'lucide-react';
import { Badge, SectionHeading, FeatureCard, TimelineStep, CTAButton } from '../components/design-system';

const codeLines = [
  'def sync_code(room_id):',
  '    users = connect(room_id)',
  '    while True:',
  '        broadcast_changes(users)',
  '        sync_cursors(users)',
  '',
  "sync_code('room-42')",
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [displayedCode, setDisplayedCode] = useState('');
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    if (lineIndex >= codeLines.length) return;
    let charIndex = 0;
    const line = codeLines[lineIndex];
    const interval = setInterval(() => {
      setDisplayedCode((prev) => prev + (line[charIndex] ?? ''));
      charIndex++;
      if (charIndex >= line.length) {
        clearInterval(interval);
        setDisplayedCode((prev) => prev + '\n');
        setLineIndex((i) => i + 1);
      }
    }, 38);
    return () => clearInterval(interval);
  }, [lineIndex]);

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, delay, ease: 'easeOut' },
  });

  return (
    <div style={{ minHeight: '100vh', color: '#f1f5f9', overflowX: 'hidden' }}>

      {/* ── NAVBAR ── */}
      <motion.header
        {...fadeUp(0)}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          background: 'rgba(11,15,25,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(99,102,241,0.3)' }}>
              <Code2 size={17} color="white" />
            </div>
            <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.01em' }}>
              Sync<span style={{ color: '#818CF8' }}>Code</span>
            </span>
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }} className="hidden md:flex">
            {['Features', 'Problem', 'How it Works'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`}
                style={{ fontSize: '14px', color: 'rgba(241,245,249,0.5)', textDecoration: 'none', transition: 'color 0.15s' }}
                className="hover:text-white"
              >{item}</a>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => navigate('/login')}
              style={{ fontSize: '14px', color: 'rgba(241,245,249,0.5)', padding: '7px 14px', borderRadius: '9px', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}
              className="hover:text-white hover:bg-white/5"
            >Sign In</button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/register')}
              style={{ padding: '8px 18px', borderRadius: '10px', background: '#4F46E5', color: '#fff', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 2px 10px rgba(99,102,241,0.3)' }}
            >Get Started</motion.button>
          </div>
        </div>
      </motion.header>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', paddingTop: '160px', paddingBottom: '100px', textAlign: 'center', overflow: 'hidden' }}>
        {/* Subtle ambient orbs */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '15%', left: '20%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: '10%', right: '15%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(37,99,235,0.05) 0%, transparent 70%)', borderRadius: '50%' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
          <motion.div {...fadeUp(0.1)} style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
            <Badge icon={Sparkles} variant="default">Real-time Collaborative Coding Platform</Badge>
          </motion.div>

          <motion.h1 {...fadeUp(0.2)}
            style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '20px' }}
          >
            Code Together,<br />
            <span style={{ color: '#818CF8' }}>In Real Time</span>
          </motion.h1>

          <motion.p {...fadeUp(0.3)}
            style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', color: '#6B7280', maxWidth: '600px', margin: '0 auto 36px', lineHeight: 1.7 }}
          >
            Collaborate instantly with your team. Share rooms, execute code, and chat — all in one seamless platform built for developers and educators.
          </motion.p>

          <motion.div {...fadeUp(0.4)} style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '52px' }}>
            <motion.button whileHover={{ scale: 1.04, translateY: -2 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/register')}
              style={{ padding: '13px 28px', borderRadius: '12px', background: '#4F46E5', color: '#fff', fontSize: '15px', fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              Start Coding Free <ArrowRight size={16} />
            </motion.button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/login')}
              style={{ padding: '13px 28px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#f1f5f9', fontSize: '15px', fontWeight: 600, border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.15s' }}
              className="hover:bg-white/10 hover:border-white/20"
            >
              <Play size={14} /> Watch Demo
            </motion.button>
          </motion.div>

          {/* Social proof */}
          <motion.div {...fadeUp(0.5)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '28px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex' }}>
                {['#4F46E5', '#2563EB', '#7C3AED', '#0891B2'].map((c, i) => (
                  <div key={i} style={{ width: '30px', height: '30px', borderRadius: '50%', background: c, border: '2px solid #0B0F19', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: '#fff', marginLeft: i > 0 ? '-8px' : 0 }}>
                    {['AS', 'BK', 'CM', 'DL'][i]}
                  </div>
                ))}
              </div>
              <span style={{ fontSize: '13px', color: '#6B7280' }}>Trusted by 10K+ developers</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {[1,2,3,4,5].map(i => <Star key={i} size={13} fill="#FBBF24" color="#FBBF24" />)}
              <span style={{ fontSize: '13px', color: '#6B7280', marginLeft: '4px' }}>4.9/5 rating</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── ANIMATED EDITOR DEMO ── */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px 96px' }}>
        <motion.div
          initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}
        >
          {/* Window chrome */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', background: '#111827', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', gap: '7px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EF4444' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F59E0B' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10B981' }} />
            </div>
            <span style={{ fontSize: '12px', color: '#4B5563', fontFamily: 'JetBrains Mono, monospace' }}>room-42 · Python · 3 collaborators</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', animation: 'pulse-dot 2s infinite' }} />
              <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>LIVE</span>
            </div>
          </div>
          {/* Code */}
          <div style={{ background: '#0D1117', display: 'flex' }}>
            <div style={{ padding: '20px 16px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.06)', userSelect: 'none', minWidth: '40px' }}>
              {codeLines.map((_, i) => <div key={i} style={{ lineHeight: '22px', height: '22px' }}>{i + 1}</div>)}
            </div>
            <pre style={{ flex: 1, padding: '20px', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace', color: '#34D399', whiteSpace: 'pre-wrap', lineHeight: '22px', overflow: 'hidden', margin: 0 }}>
              {displayedCode}
              <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.7, repeat: Infinity }} style={{ color: '#fff' }}>|</motion.span>
            </pre>
          </div>
        </motion.div>
      </section>

      {/* ── PROBLEM SECTION ── */}
      <section id="problem" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 96px' }}>
        <div style={{ marginBottom: '48px' }}>
          <SectionHeading title="The Problem" subtitle="Real coding collaboration tools don't exist for most teams and classrooms." align="center" eyebrow="Why SyncCode?" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {[
            { icon: Monitor, title: 'Students Fall Behind', description: 'Teachers demo code but students struggle to follow. No way to track progress in real-time. Learning becomes passive.' },
            { icon: BookOpen, title: 'Delayed Feedback', description: 'Code reviews happen after class. By the time teachers spot mistakes, bad habits are already formed.' },
            { icon: Globe, title: 'No Free Solution', description: 'Professional tools cost hundreds per month. Teams resort to screen-sharing and manual code copying.' },
          ].map((item, i) => <FeatureCard key={i} icon={item.icon} title={item.title} description={item.description} index={i} />)}
        </div>
      </section>

      {/* ── SOLUTION SECTION ── */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 96px' }}>
        <div style={{ marginBottom: '48px' }}>
          <SectionHeading title="The Solution" subtitle="SyncCode brings real-time collaboration to coding with zero friction." align="center" eyebrow="How We Solve It" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {[
            { icon: Zap, title: 'Real-Time Sync', description: 'Every keystroke, cursor, and edit synced in milliseconds. No lag, no conflicts.' },
            { icon: Terminal, title: 'Execute Together', description: 'Run code live in a sandboxed environment. Debug collaboratively in real-time.' },
            { icon: MessageSquare, title: 'Built-In Chat', description: 'Discuss code without switching apps. Keep conversations contextual and fast.' },
          ].map((item, i) => <FeatureCard key={i} icon={item.icon} title={item.title} description={item.description} index={i} accent="blue" />)}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 96px' }}>
        <div style={{ marginBottom: '48px' }}>
          <SectionHeading title="Why SyncCode?" subtitle="Everything a collaborative team needs, nothing they don't." align="center" eyebrow="Features" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {[
            { icon: Code2, title: 'Multi-Language Support', desc: 'JavaScript, Python, and more with full syntax highlighting.' },
            { icon: Users, title: 'Unlimited Collaborators', desc: 'Invite as many teammates as you need. No per-seat pricing.' },
            { icon: Zap, title: 'Instant Room Creation', desc: 'Create a session in seconds. Share the link and start.' },
            { icon: Terminal, title: 'Sandboxed Execution', desc: 'Run code safely with resource limits. Perfect for any environment.' },
            { icon: Globe, title: 'Browser-Based', desc: 'No installation needed. Works on any device with a modern browser.' },
            { icon: Lightbulb, title: 'Open Source', desc: 'Transparent, community-driven, and available on GitHub.' },
          ].map((item, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
              style={{ display: 'flex', gap: '16px', padding: '20px 24px', borderRadius: '14px', background: '#111827', border: '1px solid rgba(255,255,255,0.07)', transition: 'border-color 0.2s, box-shadow 0.2s' }}
              className="hover:border-indigo-500/25 hover:shadow-[0_8px_28px_rgba(0,0,0,0.35)]"
            >
              <div style={{ flexShrink: 0, width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <item.icon size={18} color="#818CF8" />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#f1f5f9', marginBottom: '5px' }}>{item.title}</h3>
                <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ maxWidth: '700px', margin: '0 auto', padding: '0 24px 96px' }}>
        <div style={{ marginBottom: '48px' }}>
          <SectionHeading title="How It Works" subtitle="Get started in under 60 seconds." align="center" eyebrow="Quick Start" />
        </div>
        <div>
          {[
            { num: 1, title: 'Create or Join a Room', desc: 'Invite your team with a unique room link. No extra sign-up required.', icon: Rocket },
            { num: 2, title: 'Start Coding Together', desc: "Write code in the editor. See teammates' cursors and edits in real-time.", icon: Code2 },
            { num: 3, title: 'Execute & Debug', desc: 'Run code instantly. See output in the terminal. Debug together.', icon: Terminal },
            { num: 4, title: 'Chat & Collaborate', desc: 'Discuss directly in the chat panel. Keep conversations contextual.', icon: MessageSquare },
          ].map((step, i) => (
            <TimelineStep key={i} number={step.num} title={step.title} description={step.desc} icon={step.icon} isLast={i === 3} />
          ))}
        </div>
      </section>

      {/* ── USE CASES ── */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 96px' }}>
        <div style={{ marginBottom: '48px' }}>
          <SectionHeading title="Built for Every Team" subtitle="From classrooms to boardrooms." align="center" eyebrow="Use Cases" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {[
            { icon: GraduationCap, title: 'Classroom Teaching', desc: 'Live code demos. Students see every keystroke. Interactive learning.' },
            { icon: Code2, title: 'Pair Programming', desc: 'Code together on complex problems. Driver-navigator pattern simplified.' },
            { icon: Briefcase, title: 'Technical Interviews', desc: 'Collaborative coding assessments with real-time evaluation.' },
            { icon: Users, title: 'Team Collaboration', desc: 'Code review sessions. Quick feedback loops. Better quality code.' },
          ].map((item, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              style={{ padding: '22px', borderRadius: '14px', background: '#111827', border: '1px solid rgba(255,255,255,0.07)', transition: 'border-color 0.2s, box-shadow 0.2s' }}
              className="hover:border-indigo-500/25 hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <item.icon size={18} color="#818CF8" />
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#f1f5f9', marginBottom: '6px' }}>{item.title}</h3>
              <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.65 }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px 96px', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ padding: '56px 40px', borderRadius: '20px', background: '#111827', border: '1px solid rgba(99,102,241,0.2)', position: 'relative', overflow: 'hidden' }}
        >
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '400px', height: '200px', background: 'radial-gradient(ellipse at top, rgba(99,102,241,0.12), transparent 70%)', pointerEvents: 'none' }} />
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em', marginBottom: '12px', position: 'relative' }}>
            Ready to code together?
          </h2>
          <p style={{ fontSize: '16px', color: '#6B7280', marginBottom: '32px', lineHeight: 1.65, position: 'relative' }}>
            Join thousands of developers and educators using SyncCode for real-time collaboration.
          </p>
          <motion.button whileHover={{ scale: 1.04, translateY: -2 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/register')}
            style={{ padding: '13px 32px', borderRadius: '12px', background: '#4F46E5', color: '#fff', fontSize: '15px', fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(99,102,241,0.35)', position: 'relative' }}
          >
            Start Free Now →
          </motion.button>
        </motion.div>
      </section>

      {/* ── FOOTER (minimal) ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '28px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Code2 size={14} color="white" />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>SyncCode</span>
          </div>
          <p style={{ fontSize: '13px', color: '#4B5563' }}>© 2024 SyncCode. All rights reserved.</p>
          <a href="#" style={{ color: '#4B5563', transition: 'color 0.15s' }} className="hover:text-white">
            <Github size={18} />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
