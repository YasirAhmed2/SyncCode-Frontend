import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Navbar } from '../components/navbar';
import { useAuth } from '../context/auth.context';
import { useRoom } from '../context/room.context';
import { motion } from 'framer-motion';
import {
  Plus, ArrowRight, Clock, Code2, LogIn, X,
  Copy, Check, Zap, Terminal, Users
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { roomService } from '../lib/roomService';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function RoomCardSkeleton() {
  return (
    <div style={{ padding: '20px', borderRadius: '14px', background: '#111827', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="skeleton h-4 w-1/3 rounded-full mb-3" />
      <div className="skeleton h-3 w-2/3 rounded-full mb-4" />
      <div className="skeleton h-3 w-1/4 rounded-full" />
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { joinRoom, createRoom } = useRoom();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [language, setLanguage] = useState<'javascript' | 'python'>('javascript');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await roomService.getMyRooms();
        if (res.success) setRooms(res.rooms);
      } catch (e) {
        console.error('Failed to fetch rooms', e);
      } finally {
        setLoadingRooms(false);
      }
    };
    fetchRooms();
  }, []);

  const handleCreateRoom = async () => {
    setIsLoading(true);
    try {
      const newRoom = await createRoom(language);
      toast({ title: 'Room created!', description: `"${newRoom.id}" is ready.` });
      setIsCreateDialogOpen(false);
      navigate(`/rooms/${newRoom.id}`);
    } catch {
      toast({ title: 'Failed to create room', description: 'Something went wrong.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!joinRoomId.trim()) return;
    setIsLoading(true);
    try {
      await joinRoom(joinRoomId);
      toast({ title: 'Joined room!', description: 'You are now in the coding session.' });
      setIsJoinDialogOpen(false);
      setJoinRoomId('');
      navigate(`/rooms/${joinRoomId}`);
    } catch {
      toast({ title: 'Failed to join room', description: 'Room not found or access denied.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: 'easeOut' },
  });

  const langColors: Record<string, { bg: string; text: string; label: string }> = {
    javascript: { bg: 'rgba(234,179,8,0.1)', text: '#FBBF24', label: 'JS' },
    python: { bg: 'rgba(59,130,246,0.1)', text: '#60A5FA', label: 'PY' },
  };

  const S = {
    card: {
      background: '#111827',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '16px',
    } as React.CSSProperties,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0B0F19' }}>
      <Navbar />

      <main style={{ paddingTop: '96px', paddingBottom: '64px', padding: '96px 20px 64px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

          {/* Welcome */}
          <motion.div {...fadeUp(0)} style={{ marginBottom: '40px' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6366F1', marginBottom: '6px' }}>
              {getGreeting()}
            </p>
            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em', marginBottom: '8px' }}>
              {user?.name || 'Developer'} 👋
            </h1>
            <p style={{ fontSize: '15px', color: '#6B7280' }}>
              Create a new room or jump back into a recent session.
            </p>
          </motion.div>

          {/* Stats Row */}
          <motion.div {...fadeUp(0.05)} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '32px' }}>
            {[
              { icon: <Code2 size={16} />, label: 'Total Rooms', val: rooms.length },
              { icon: <Users size={16} />, label: 'Collaborators', val: '—' },
              { icon: <Zap size={16} />, label: 'Sessions Today', val: '—' },
            ].map((s, i) => (
              <div key={i} style={{ ...S.card, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#f1f5f9', lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '3px' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Action Cards */}
          <motion.div {...fadeUp(0.1)} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '48px' }}>

            {/* CREATE ROOM */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <motion.div
                  whileHover={{ y: -3 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  style={{ ...S.card, padding: '28px', cursor: 'pointer', transition: 'border-color 0.2s, box-shadow 0.2s', position: 'relative', overflow: 'hidden' }}
                  className="hover:border-indigo-500/30 hover:shadow-[0_8px_28px_rgba(0,0,0,0.4)]"
                >
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '120px', background: 'radial-gradient(circle at top right, rgba(99,102,241,0.08), transparent 70%)', pointerEvents: 'none' }} />
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}>
                    <Plus size={22} color="white" />
                  </div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#f1f5f9', marginBottom: '8px' }}>Create New Room</h3>
                  <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '20px', lineHeight: 1.65 }}>
                    Start a fresh coding session and invite your team with a shareable Room ID.
                  </p>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#818CF8' }}>
                    Create Room <ArrowRight size={14} />
                  </span>
                </motion.div>
              </DialogTrigger>

              <DialogContent style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', maxWidth: '420px' }}>
                <DialogHeader>
                  <DialogTitle style={{ fontSize: '18px', fontWeight: 700, color: '#f1f5f9' }}>Create New Room</DialogTitle>
                  <DialogDescription style={{ color: '#6B7280' }}>Choose a programming language to get started.</DialogDescription>
                </DialogHeader>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', paddingTop: '8px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 500, color: '#9CA3AF', display: 'block', marginBottom: '10px' }}>Select Language</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {(['javascript', 'python'] as const).map(lang => {
                        const c = langColors[lang];
                        const active = language === lang;
                        return (
                          <button key={lang} type="button" onClick={() => setLanguage(lang)}
                            style={{
                              padding: '14px', borderRadius: '12px', border: active ? `1.5px solid ${c.text}` : '1px solid rgba(255,255,255,0.1)',
                              background: active ? c.bg : 'transparent', color: active ? c.text : 'rgba(255,255,255,0.4)',
                              fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.15s',
                            }}
                          >
                            <span style={{ width: '30px', height: '30px', borderRadius: '8px', background: c.bg, color: c.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800 }}>{c.label}</span>
                            <span style={{ textTransform: 'capitalize' }}>{lang}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <button onClick={handleCreateRoom} disabled={!language || isLoading}
                    style={{ width: '100%', padding: '13px', borderRadius: '12px', background: '#4F46E5', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: isLoading ? 0.7 : 1, transition: 'all 0.15s', fontSize: '14px' }}
                  >
                    {isLoading ? <><div className="spinner-sm" /> Creating…</> : <><Plus size={15} /> Create Room</>}
                  </button>
                </div>
              </DialogContent>
            </Dialog>

            {/* JOIN ROOM */}
            <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
              <DialogTrigger asChild>
                <motion.div
                  whileHover={{ y: -3 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  style={{ ...S.card, padding: '28px', cursor: 'pointer', transition: 'border-color 0.2s, box-shadow 0.2s', position: 'relative', overflow: 'hidden' }}
                  className="hover:border-blue-500/30 hover:shadow-[0_8px_28px_rgba(0,0,0,0.4)]"
                >
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '120px', background: 'radial-gradient(circle at top right, rgba(37,99,235,0.07), transparent 70%)', pointerEvents: 'none' }} />
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                    <LogIn size={22} color="#60A5FA" />
                  </div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#f1f5f9', marginBottom: '8px' }}>Join a Room</h3>
                  <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '20px', lineHeight: 1.65 }}>
                    Enter a Room ID shared by your teammate to join an existing live session.
                  </p>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#60A5FA' }}>
                    Join Room <ArrowRight size={14} />
                  </span>
                </motion.div>
              </DialogTrigger>

              <DialogContent style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', maxWidth: '420px' }}>
                <DialogHeader>
                  <DialogTitle style={{ fontSize: '18px', fontWeight: 700, color: '#f1f5f9' }}>Join a Room</DialogTitle>
                  <DialogDescription style={{ color: '#6B7280' }}>Paste the Room ID shared with you.</DialogDescription>
                </DialogHeader>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '8px' }}>
                  <div>
                    <Label htmlFor="roomId" style={{ color: '#9CA3AF', fontSize: '13px' }}>Room ID</Label>
                    <Input
                      id="roomId" placeholder="room_xxxxxx" value={joinRoomId}
                      onChange={(e) => setJoinRoomId(e.target.value)}
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontFamily: 'JetBrains Mono, monospace', marginTop: '8px' }}
                      className="placeholder:text-white/25 focus:border-blue-500/50 focus:ring-0"
                      onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                    />
                  </div>
                  <button onClick={handleJoinRoom} disabled={!joinRoomId.trim() || isLoading}
                    style={{ width: '100%', padding: '13px', borderRadius: '12px', background: '#2563EB', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: !joinRoomId.trim() || isLoading ? 0.5 : 1, transition: 'all 0.15s', fontSize: '14px' }}
                  >
                    {isLoading ? <><div className="spinner-sm" /> Joining…</> : <><LogIn size={15} /> Join Room</>}
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>

          {/* Recent Rooms */}
          <motion.div {...fadeUp(0.2)}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#f1f5f9' }}>Recent Rooms</h2>
              <span style={{ fontSize: '13px', color: '#4B5563' }}>{rooms.length} room{rooms.length !== 1 ? 's' : ''}</span>
            </div>

            {loadingRooms ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
                {[1,2,3].map(i => <RoomCardSkeleton key={i} />)}
              </div>
            ) : rooms.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ textAlign: 'center', padding: '72px 24px', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.01)' }}
              >
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}>
                  <Terminal size={26} color="white" />
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'rgba(241,245,249,0.6)', marginBottom: '8px' }}>No rooms yet</h3>
                <p style={{ fontSize: '14px', color: '#4B5563', marginBottom: '28px' }}>Create your first room to start collaborating</p>
                <button onClick={() => setIsCreateDialogOpen(true)}
                  style={{ padding: '11px 24px', borderRadius: '12px', background: '#4F46E5', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(99,102,241,0.3)', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
                >
                  <Plus size={15} /> Create First Room
                </button>
              </motion.div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
                {rooms.map((room: any, i: number) => {
                  const id = room.roomId || room.id;
                  const lang = room.language || 'code';
                  const lc = langColors[lang] || { bg: 'rgba(99,102,241,0.1)', text: '#818CF8', label: '??' };
                  const date = new Date(room.updatedAt || Date.now());
                  return (
                    <motion.div key={id}
                      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      whileHover={{ y: -3 }} onClick={() => navigate(`/rooms/${id}`)}
                      style={{ ...S.card, padding: '20px', cursor: 'pointer', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                      className="group hover:border-indigo-500/30 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <div style={{ padding: '4px 10px', borderRadius: '7px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em', background: lc.bg, color: lc.text }}>
                          {lang.toUpperCase()}
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleCopyId(id); }}
                          style={{ padding: '6px', borderRadius: '7px', color: 'rgba(255,255,255,0.3)', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}
                          className="hover:text-white/70 hover:bg-white/5" title="Copy Room ID"
                        >
                          {copiedId === id ? <Check size={14} color="#34D399" /> : <Copy size={14} />}
                        </button>
                      </div>
                      <p style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.25)', marginBottom: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{id}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#4B5563' }}>
                        <Clock size={12} />
                        <span>{date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px', color: '#4B5563' }}>Click to rejoin</span>
                        <ArrowRight size={14} color="#4B5563" className="group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all duration-200" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}