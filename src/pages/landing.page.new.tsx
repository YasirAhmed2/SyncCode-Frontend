import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, Zap, Code2, Users, Play, ArrowRight,
  CheckCircle2, XCircle, BookOpen, Monitor, Briefcase,
  GraduationCap, MessageSquare, Terminal, Globe,
  ChevronRight, Github, Linkedin, Star, Lightbulb, Rocket, Target
} from 'lucide-react';
import {
  Badge,
  SectionHeading,
  FeatureCard,
  TimelineStep,
  CTAButton,
  GlassCard,
} from '../components/design-system';

/* Typing animation code lines */
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

  return (
    <div className="min-h-screen text-white overflow-x-hidden">
      {/* ========== NAVBAR ========== */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-md border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <motion.div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">
              Sync<span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">Code</span>
            </span>
          </motion.div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-10 text-sm">
            {['Features', 'Problem', 'How it Works'].map((item, i) => (
              <a
                key={i}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-lg"
            >
              Sign In
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-shadow"
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* ========== HERO SECTION ========== */}
      <section className="relative pt-40 pb-32 px-6 text-center overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600 blur-3xl opacity-20 rounded-full animate-float" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-600 blur-3xl opacity-15 rounded-full animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-cyan-500 blur-3xl opacity-10 rounded-full animate-float" style={{ animationDelay: '2s' }} />
        </div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <Badge icon={Sparkles} variant="default">
            Realtime Collaborative Coding Platform
          </Badge>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-6xl md:text-7xl lg:text-8xl font-black leading-tight mb-6"
        >
          Code Together,
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
            In Real Time
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12"
        >
          Collaborate instantly with your team. Share rooms, execute code, chat — all in one seamless platform. Perfect for education, pair programming, and remote work.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/register')}
            className="group px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-xl shadow-indigo-500/40 hover:shadow-indigo-500/60 transition-all flex items-center justify-center gap-2"
          >
            Start Coding Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
            className="px-8 py-4 rounded-xl border border-white/20 hover:border-indigo-500/50 hover:bg-white/5 text-white font-semibold transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" /> Watch Demo
          </motion.button>
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              {['#6366F1', '#8B5CF6', '#3B82F6', '#00D9FF'].map((color, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: color }}
                >
                  {['AS', 'BK', 'CM', 'DL'][i]}
                </div>
              ))}
            </div>
            <span className="text-gray-400">Trusted by 10K+ developers</span>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="text-gray-400 ml-2">4.9/5 on ProductHunt</span>
          </div>
        </motion.div>
      </section>

      {/* ========== ANIMATED EDITOR DEMO ========== */}
      <section className="max-w-5xl mx-auto px-6 mb-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="rounded-2xl overflow-hidden shadow-2xl border border-indigo-500/30 bg-black"
        >
          {/* Window Chrome */}
          <div className="flex items-center justify-between px-6 py-4 bg-black/80 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="text-xs text-gray-500 font-mono">room-42 · Python · 3 collaborators</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-semibold">LIVE</span>
            </div>
          </div>

          {/* Code Editor */}
          <div className="bg-[#0d1117] flex">
            <div className="select-none px-4 py-6 text-right font-mono text-xs text-white/30 border-r border-white/10 min-w-fit">
              {codeLines.map((_, i) => (
                <div key={i} className="leading-6 h-6">
                  {i + 1}
                </div>
              ))}
            </div>
            <pre className="flex-1 p-6 text-sm font-mono text-emerald-400 whitespace-pre-wrap leading-6 overflow-hidden">
              {displayedCode}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.7, repeat: Infinity }}
                className="text-white"
              >
                |
              </motion.span>
            </pre>
          </div>
        </motion.div>
      </section>

      {/* ========== PROBLEM SECTION ========== */}
      <section id="problem" className="max-w-6xl mx-auto px-6 mb-32">
        <SectionHeading
          title="The Problem"
          subtitle="Real collaboration tools don't exist for coding"
          align="center"
        />

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          {[
            {
              icon: Monitor,
              title: 'Students Fall Behind',
              description: 'Teachers demo code but students struggle to follow. No way to see progress in real-time. Learning becomes passive, not interactive.',
            },
            {
              icon: BookOpen,
              title: 'Delayed Feedback',
              description: 'Code reviews happen after class. Teachers can\'t spot mistakes as they happen. By then, bad habits are already formed.',
            },
            {
              icon: Globe,
              title: 'No Free Solution',
              description: 'Professional tools cost hundreds per month. Teams resort to hacky workarounds with screen sharing and manual code copying.',
            },
          ].map((item, i) => (
            <FeatureCard key={i} icon={item.icon} title={item.title} description={item.description} index={i} />
          ))}
        </div>
      </section>

      {/* ========== SOLUTION SECTION ========== */}
      <section className="max-w-6xl mx-auto px-6 mb-32">
        <SectionHeading
          title="The Solution"
          subtitle="SyncCode brings real-time collaboration to coding"
          align="center"
        />

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          {[
            {
              icon: Zap,
              title: 'Real-Time Sync',
              description: 'Every keystroke, cursor, and edit synced in milliseconds. Participants see changes instantly without lag.',
            },
            {
              icon: Terminal,
              title: 'Execute Together',
              description: 'Run code live in a sandboxed environment. See outputs instantly. Debug collaboratively in real-time.',
            },
            {
              icon: MessageSquare,
              title: 'Built-In Chat',
              description: 'Discuss code without switching apps. Contextual conversations keep the flow going smoothly.',
            },
          ].map((item, i) => (
            <FeatureCard key={i} icon={item.icon} title={item.title} description={item.description} index={i} />
          ))}
        </div>
      </section>

      {/* ========== FEATURES SECTION ========== */}
      <section id="features" className="max-w-6xl mx-auto px-6 mb-32">
        <SectionHeading
          title="Why Choose SyncCode?"
          subtitle="Everything a collaborative team needs"
          align="center"
        />

        <div className="grid md:grid-cols-2 gap-8 mt-16">
          {[
            { icon: Code2, title: 'Multi-Language Support', desc: 'JavaScript, Python, and more with syntax highlighting and formatting.' },
            { icon: Users, title: 'Unlimited Collaborators', desc: 'Invite as many teammates as you want. No per-seat pricing.' },
            { icon: Zap, title: 'Instant Room Creation', desc: 'Create a collaborative space in seconds. Share the link and start coding.' },
            { icon: Terminal, title: 'Sandboxed Execution', desc: 'Run code safely with resource limits. Perfect for untrusted code.' },
            { icon: Globe, title: 'Browser-Based', desc: 'No installation needed. Works on any device with a modern browser.' },
            { icon: Lightbulb, title: 'Open Source', desc: 'Transparent, community-driven, and available on GitHub.' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex gap-6 p-8 rounded-2xl border border-white/10 hover:border-indigo-500/30 bg-white/5 hover:bg-white/10 transition-all duration-300 group"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section id="how-it-works" className="max-w-4xl mx-auto px-6 mb-32">
        <SectionHeading
          title="How It Works"
          subtitle="Get started in minutes"
          align="center"
        />

        <div className="mt-16 space-y-0">
          {[
            { num: 1, title: 'Create or Join a Room', desc: 'Invite your team with a unique room link. No sign-up required for guests.' },
            { num: 2, title: 'Start Coding Together', desc: 'Write code in the editor. See teammates\' cursors and changes in real-time.' },
            { num: 3, title: 'Execute & Debug', desc: 'Run code instantly. See output in the terminal. Debug together.' },
            { num: 4, title: 'Chat & Collaborate', desc: 'Discuss directly in the chat panel. Keep conversations contextual.' },
          ].map((step, i) => (
            <TimelineStep
              key={i}
              number={step.num}
              title={step.title}
              description={step.desc}
              icon={[Rocket, Code2, Terminal, MessageSquare][i]}
              isLast={i === 3}
            />
          ))}
        </div>
      </section>

      {/* ========== USE CASES ========== */}
      <section className="max-w-6xl mx-auto px-6 mb-32">
        <SectionHeading
          title="Built for Every Team"
          subtitle="From classrooms to boardrooms"
          align="center"
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {[
            { icon: GraduationCap, title: 'Classroom Teaching', desc: 'Live code demos. Students see every keystroke. Interactive learning.' },
            { icon: Code2, title: 'Pair Programming', desc: 'Code together on complex problems. Driver-navigator pattern simplified.' },
            { icon: Briefcase, title: 'Technical Interviews', desc: 'Collaborative coding assessments. Real-time feedback and evaluation.' },
            { icon: Users, title: 'Team Collaboration', desc: 'Code review sessions. Quick feedback loops. Better code quality.' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/30 hover:bg-white/10 transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="max-w-4xl mx-auto px-6 mb-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="p-12 rounded-3xl bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-cyan-500/20 border border-indigo-500/30 backdrop-blur-xl"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to code together?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join thousands of developers and educators using SyncCode for real-time collaboration.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/register')}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-xl shadow-indigo-500/40 hover:shadow-indigo-500/60 transition-all"
          >
            Start Free Now
          </motion.button>
        </motion.div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                  <Code2 className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold">SyncCode</span>
              </div>
              <p className="text-sm text-gray-500">Real-time collaborative coding for everyone.</p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Roadmap'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Security'] },
            ].map((col, i) => (
              <div key={i}>
                <p className="font-semibold text-white mb-4">{col.title}</p>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-8 flex items-center justify-between text-sm text-gray-500">
            <p>&copy; 2024 SyncCode. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-white transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
