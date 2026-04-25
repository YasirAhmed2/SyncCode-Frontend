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
    <div className="p-5 rounded-[14px] bg-card border border-border/70">
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
  const [roomName, setRoomName] = useState('');
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
    if (!roomName.trim()) {
      toast({ title: 'Room name required', description: 'Please enter a room name before creating.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const newRoom = await createRoom(language, roomName.trim());
      toast({ title: 'Room created!', description: `"${newRoom.name}" is ready.` });
      setIsCreateDialogOpen(false);
      setRoomName('');
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16 px-5">
        <div className="max-w-[1100px] mx-auto">

          {/* Welcome */}
          <motion.div {...fadeUp(0)} className="mb-10">
            <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-1.5">
              {getGreeting()}
            </p>
            <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold text-foreground tracking-tight mb-2">
              {user?.name || 'Developer'} 👋
            </h1>
            <p className="text-[15px] text-muted-foreground">
              Create a new room or jump back into a recent session.
            </p>
          </motion.div>

          {/* Stats Row */}
          <motion.div {...fadeUp(0.05)} className="grid grid-cols-3 gap-3.5 mb-8">
            {[
              { icon: <Code2 size={16} />, label: 'Total Rooms', val: rooms.length },
              { icon: <Users size={16} />, label: 'Collaborators', val: '—' },
              { icon: <Zap size={16} />, label: 'Sessions Today', val: '—' },
            ].map((s, i) => (
              <div key={i} className="bg-card border border-border/70 rounded-2xl py-4 px-5 flex items-center gap-3.5 shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shrink-0">
                  {s.icon}
                </div>
                <div>
                  <div className="text-xl font-bold text-foreground leading-none">{s.val}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Action Cards */}
          <motion.div {...fadeUp(0.1)} className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 mb-12">

            {/* CREATE ROOM */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <motion.div
                  whileHover={{ y: -3 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="bg-card border border-border/70 rounded-2xl p-7 cursor-pointer transition-all duration-200 relative overflow-hidden hover:border-primary/30 hover:shadow-[0_8px_28px_rgba(99,102,241,0.15)] group"
                >
                  <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.08),transparent_70%)] pointer-events-none" />
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4 shadow-[0_4px_16px_rgba(99,102,241,0.3)]">
                    <Plus size={22} color="white" />
                  </div>
                  <h3 className="text-[17px] font-bold text-foreground mb-2">Create New Room</h3>
                  <p className="text-[13px] text-muted-foreground mb-5 leading-relaxed">
                    Start a fresh coding session and invite your team with a shareable Room ID.
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary transition-transform group-hover:translate-x-1">
                    Create Room <ArrowRight size={14} />
                  </span>
                </motion.div>
              </DialogTrigger>

              <DialogContent className="bg-card border border-border/70 max-w-[420px] sm:rounded-[1.2rem]">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold text-foreground">Create New Room</DialogTitle>
                  <DialogDescription className="text-muted-foreground">Choose a programming language to get started.</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 pt-2">
                  <div>
                    <Label htmlFor="roomName" className="text-muted-foreground text-[13px]">Room Name</Label>
                    <Input
                      id="roomName"
                      placeholder="e.g. DSA Revision Batch"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      maxLength={80}
                      className="bg-background border-border/70 text-foreground mt-2 placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-muted-foreground block mb-2.5">Select Language</label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {(['javascript', 'python'] as const).map(lang => {
                        const c = langColors[lang];
                        const active = language === lang;
                        return (
                          <button key={lang} type="button" onClick={() => setLanguage(lang)}
                            className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-[14px] font-semibold transition-all duration-150 ${
                              active ? 'border-primary/40 bg-primary/10' : 'border-border/50 bg-background/50 hover:bg-muted text-muted-foreground'
                            }`}
                            style={{ color: active ? c.text : undefined }}
                          >
                            <span className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-extrabold" style={{ background: c.bg, color: c.text }}>{c.label}</span>
                            <span className="capitalize">{lang}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <button onClick={handleCreateRoom} disabled={!language || !roomName.trim() || isLoading}
                    className="w-full p-3 rounded-xl bg-primary text-primary-foreground font-bold border-none cursor-pointer shadow-[0_4px_16px_rgba(99,102,241,0.3)] flex items-center justify-center gap-2 transition-all duration-150 text-[14px] disabled:opacity-70 disabled:cursor-not-allowed hover:bg-primary/90"
                  >
                    {isLoading ? <><div className="spinner-sm border-white/20 border-t-white" /> Creating…</> : <><Plus size={15} /> Create Room</>}
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
                  className="bg-card border border-border/70 rounded-2xl p-7 cursor-pointer transition-all duration-200 relative overflow-hidden hover:border-blue-500/30 hover:shadow-[0_8px_28px_rgba(37,99,235,0.15)] group"
                >
                  <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.07),transparent_70%)] pointer-events-none" />
                  <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center mb-4">
                    <LogIn size={22} className="text-blue-500 dark:text-blue-400" />
                  </div>
                  <h3 className="text-[17px] font-bold text-foreground mb-2">Join a Room</h3>
                  <p className="text-[13px] text-muted-foreground mb-5 leading-relaxed">
                    Enter a Room ID shared by your teammate to join an existing live session.
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-blue-500 dark:text-blue-400 transition-transform group-hover:translate-x-1">
                    Join Room <ArrowRight size={14} />
                  </span>
                </motion.div>
              </DialogTrigger>

              <DialogContent className="bg-card border border-border/70 max-w-[420px] sm:rounded-[1.2rem]">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold text-foreground">Join a Room</DialogTitle>
                  <DialogDescription className="text-muted-foreground">Paste the Room ID shared with you.</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-3.5 pt-2">
                  <div>
                    <Label htmlFor="roomId" className="text-muted-foreground text-[13px]">Room ID</Label>
                    <Input
                      id="roomId" placeholder="room_xxxxxx" value={joinRoomId}
                      onChange={(e) => setJoinRoomId(e.target.value)}
                      className="bg-background border-border/70 text-foreground font-mono mt-2 placeholder:text-muted-foreground/50 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                      onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                    />
                  </div>
                  <button onClick={handleJoinRoom} disabled={!joinRoomId.trim() || isLoading}
                    className="w-full p-3 rounded-xl bg-blue-600 text-white font-bold border-none cursor-pointer flex items-center justify-center gap-2 transition-all duration-150 text-[14px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
                  >
                    {isLoading ? <><div className="spinner-sm border-white/20 border-t-white" /> Joining…</> : <><LogIn size={15} /> Join Room</>}
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>

          {/* Recent Rooms */}
          <motion.div {...fadeUp(0.2)}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[17px] font-bold text-foreground">Recent Rooms</h2>
              <span className="text-[13px] text-muted-foreground">{rooms.length} room{rooms.length !== 1 ? 's' : ''}</span>
            </div>

            {loadingRooms ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3.5">
                {[1,2,3].map(i => <RoomCardSkeleton key={i} />)}
              </div>
            ) : rooms.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-20 px-6 rounded-2xl border border-dashed border-border/70 bg-muted/10"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-[0_4px_20px_rgba(99,102,241,0.3)]">
                  <Terminal size={26} color="white" />
                </div>
                <h3 className="text-[17px] font-bold text-foreground/80 mb-2">No rooms yet</h3>
                <p className="text-[14px] text-muted-foreground mb-7">Create your first room to start collaborating</p>
                <button onClick={() => setIsCreateDialogOpen(true)}
                  className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold border-none cursor-pointer shadow-[0_4px_16px_rgba(99,102,241,0.3)] inline-flex items-center gap-2 text-[14px] hover:bg-primary/90 transition-colors"
                >
                  <Plus size={15} /> Create First Room
                </button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3.5">
                {rooms.map((room: any, i: number) => {
                  const id = room.roomId || room.id;
                  const lang = room.language || 'code';
                  const lc = langColors[lang] || { bg: 'rgba(99,102,241,0.1)', text: '#818CF8', label: '??' };
                  const date = new Date(room.updatedAt || Date.now());
                  return (
                    <motion.div key={id}
                      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      whileHover={{ y: -3 }} onClick={() => navigate(`/rooms/${id}`)}
                      className="bg-card border border-border/70 p-5 rounded-2xl cursor-pointer transition-all duration-200 group hover:border-primary/30 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
                    >
                      <div className="flex items-start justify-between mb-3.5">
                        <div className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-[0.04em]" style={{ background: lc.bg, color: lc.text }}>
                          {lang.toUpperCase()}
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleCopyId(id); }}
                          className="p-1.5 rounded-md text-muted-foreground bg-transparent border-none cursor-pointer transition-all duration-150 hover:text-foreground hover:bg-muted" 
                          title="Copy Room ID"
                        >
                          {copiedId === id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                      <p className="text-[14px] font-bold text-foreground mb-2 overflow-hidden text-ellipsis whitespace-nowrap">
                        {room.name || 'Untitled Room'}
                      </p>
                      <p className="text-[11px] font-mono text-muted-foreground/70 mb-3 overflow-hidden text-ellipsis whitespace-nowrap">{id}</p>
                      <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                        <Clock size={12} />
                        <span>{date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                        <span className="text-[12px] text-muted-foreground">Click to rejoin</span>
                        <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
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