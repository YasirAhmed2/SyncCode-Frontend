
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Linkedin,
  Github,
  Sparkles,
  Zap,
  Code2,
  Users,
  Play
} from 'lucide-react';

const codeLines = [
  "def sync_code(room_id):",
  "    users = connect(room_id)",
  "    while True:",
  "        broadcast_changes(users)",
  "",
  "sync_code('room-42')"
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [displayedCode, setDisplayedCode] = useState('');
  const [lineIndex, setLineIndex] = useState(0);

  // Typing animation
  useEffect(() => {
    if (lineIndex >= codeLines.length) return;

    let charIndex = 0;
    const interval = setInterval(() => {
      setDisplayedCode(prev =>
        prev + codeLines[lineIndex][charIndex]
      );
      charIndex++;

      if (charIndex >= codeLines[lineIndex].length) {
        clearInterval(interval);
        setDisplayedCode(prev => prev + '\n');
        setLineIndex(i => i + 1);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [lineIndex]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b061f] via-[#120b3a] to-[#020617] text-white overflow-hidden">

        {/* Header */}
      <header className="flex justify-between items-center px-8 py-6 relative z-10">
        <div className="flex gap-4">
          <a className="p-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur" href="https://www.linkedin.com/in/iamyasirahmed/">
            <Linkedin className="text-blue-400" />
          </a>
          <a className="p-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur" href="https://github.com/YasirAhmed2">
            <Github className="text-gray-200" />
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="text-center px-6 py-24 relative z-10">
        <div className="inline-flex gap-3 items-center px-6 py-3 mb-8 rounded-full bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-purple-400/30 backdrop-blur">
          <Sparkles className="text-purple-400" />
          <span className="text-purple-200 text-sm font-semibold">
            Realtime Online Collaborative Coding Platform
          </span>
        </div>

        <h1 className="text-6xl md:text-8xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Sync<span className="text-purple-400">Code</span>
        </h1>

        <p className="text-2xl md:text-3xl text-gray-300 max-w-3xl mx-auto mb-12">
          Code together in real-time with your team
        </p>

        <button
          onClick={() => navigate('/login')}
          className="px-14 py-6 text-xl font-bold rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:scale-105 transition shadow-2xl"
        >
          Get Started →
        </button>
      </section>

      {/* FAKE LIVE EDITOR */}
      <section className="max-w-5xl mx-auto px-6 mb-32 relative z-10">
        <div className="rounded-2xl bg-[#0f172a] border border-white/10 shadow-2xl overflow-hidden">

          {/* Editor Header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-black/40 border-b border-white/10">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-4 text-sm text-gray-400">room-42 • Python</span>
          </div>

          {/* Editor Body */}
          <pre className="p-6 text-sm md:text-base text-green-400 font-mono whitespace-pre-wrap">
            {displayedCode}
            <span className="animate-pulse">|</span>
          </pre>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10 mb-32 relative z-10">
        <Feature
          icon={<Zap />}
          title="Real-time Collaboration"
          text="See your teammates' cursors and edits live. Code together seamlessly from anywhere."
        />
        <Feature
          icon={<Code2 />}
          title="Multi-language Support"
          text="Write code in JavaScript, Python, and more with syntax highlighting and autocomplete."
        />
        <Feature
          icon={<Users />}
          title="Built-in Chat"
          text="Communicate with your team directly in the editor. Share ideas and solve problems together."
        />
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-5xl mx-auto px-6 mb-32 relative z-10">
        <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          How It Works
        </h2>

        <div className="space-y-12">
          <Step
            step="01"
            title="Signup or Signin to Get Started"
            desc="Create an account or login to access your coding rooms."
          />
          <Step
            step="02"
            title="Create or Join a Room"
            desc="Create Coding Room by selecting language or join an existing one using room ID."
          />
          <Step
            step="03"
            title="Collaborate in Real-Time"
            desc="See edits live, chat, and execute code together."
          />
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="text-center pb-24 relative z-10">
        <button
          onClick={() => navigate('/login')}
          className="inline-flex items-center gap-3 px-14 py-6 text-xl font-bold rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-105 transition shadow-2xl"
        >
          <Play /> Start Coding Now
        </button>
        <p className="mt-6 text-gray-400">
          Join thousands of developers coding together
        </p>
      </section>

      {/* BACKGROUND GLOWS */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-600 blur-3xl opacity-20 rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600 blur-3xl opacity-20 rounded-full" />
      </div>
    </div>
  );
};

export default LandingPage;

/* Helper Components */
const Feature = ({ icon, title, text }: any) => (
  <div className="p-8 rounded-2xl bg-white/5 backdrop-blur border border-white/10 hover:-translate-y-2 transition">
    <div className="p-3 rounded-xl bg-blue-500/20 inline-flex mb-5">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-gray-300">{text}</p>
  </div>
);

const Step = ({ step, title, desc }: any) => (
  <div className="flex gap-6 items-start">
    <div className="text-3xl font-bold text-blue-400">{step}</div>
    <div>
      <h4 className="text-xl font-semibold mb-2">{title}</h4>
      <p className="text-gray-400">{desc}</p>
    </div>
  </div>
);

