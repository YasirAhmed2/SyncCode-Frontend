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
  Copy, Check, Zap, Terminal, Users, Sparkles,
  ExternalLink, Trash2, Share2
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Label } from '../components/ui/label';
import { roomService } from '../lib/roomService';
import { EmptyState, LoadingState } from '../components/design-system';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

interface Room {
  id: string;
  name?: string;
  language: 'javascript' | 'python';
  createdAt: string;
  participants?: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { joinRoom, createRoom } = useRoom();
  const [rooms, setRooms] = useState<Room[]>([]);
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
        if (res.success) setRooms(res.rooms || []);
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
      toast({ title: 'Room created!', description: `Room is ready to go.` });
      setIsCreateDialogOpen(false);
      setTimeout(() => navigate(`/rooms/${newRoom.id}`), 500);
    } catch (err) {
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
      toast({ title: 'Joined!', description: 'You are now in the coding session.' });
      setIsJoinDialogOpen(false);
      const roomId = joinRoomId;
      setJoinRoomId('');
      setTimeout(() => navigate(`/rooms/${roomId}`), 500);
    } catch (err) {
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

  const handleDeleteRoom = async (roomId: string) => {
    // TODO: Implement room deletion
    toast({ title: 'Delete room', description: 'Feature coming soon.', variant: 'destructive' });
  };

  const langColors: Record<'javascript' | 'python', { bg: string; icon: string; label: string; color: string }> = {
    javascript: { bg: '#f0db4f', icon: 'JS', label: 'JavaScript', color: 'text-yellow-400' },
    python: { bg: '#3776ab', icon: 'PY', label: 'Python', color: 'text-blue-400' },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a1a] to-black">
      <Navbar />

      <main className="pt-24 pb-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Hero */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-indigo-400 text-sm font-semibold mb-2 uppercase tracking-wider">
                  {getGreeting()}
                </p>
                <h1 className="text-5xl md:text-6xl font-black text-white">
                  {user?.name || 'Developer'}
                </h1>
                <p className="text-gray-400 text-lg mt-2">
                  Create a room or jump into a recent session
                </p>
              </div>

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="hidden md:block p-6 rounded-2xl bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border border-indigo-500/20"
              >
                <div className="text-3xl font-bold text-indigo-400">{rooms.length}</div>
                <div className="text-sm text-gray-400 mt-1">Active Rooms</div>
              </motion.div>
            </div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-xl shadow-indigo-500/40 hover:shadow-indigo-500/60 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" /> Create New Room
                  </motion.button>
                </DialogTrigger>

                <DialogContent className="bg-[#0a0a15] border-white/10">
                  <DialogHeader>
                    <DialogTitle className="text-white text-2xl">Create New Room</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Set up a new collaborative coding session
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-5 py-6">
                    <div>
                      <Label htmlFor="lang" className="text-white mb-3 block font-semibold">
                        Programming Language
                      </Label>
                      <Select value={language} onValueChange={(val: any) => setLanguage(val)}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0a0a15] border-white/10">
                          <SelectItem value="javascript" className="text-white">
                            JavaScript
                          </SelectItem>
                          <SelectItem value="python" className="text-white">
                            Python
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCreateRoom}
                      disabled={isLoading}
                      className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" /> Create Room
                        </>
                      )}
                    </motion.button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
                <DialogTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 rounded-xl border border-white/20 hover:border-indigo-500/50 hover:bg-white/5 text-white font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-5 h-5" /> Join Room
                  </motion.button>
                </DialogTrigger>

                <DialogContent className="bg-[#0a0a15] border-white/10">
                  <DialogHeader>
                    <DialogTitle className="text-white text-2xl">Join Room</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Enter a room ID to join an existing session
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-5 py-6">
                    <div>
                      <Label htmlFor="room-id" className="text-white mb-3 block font-semibold">
                        Room ID
                      </Label>
                      <Input
                        id="room-id"
                        placeholder="Enter room ID..."
                        value={joinRoomId}
                        onChange={(e) => setJoinRoomId(e.target.value)}
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 rounded-xl"
                      />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleJoinRoom}
                      disabled={isLoading || !joinRoomId.trim()}
                      className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          Joining...
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-4 h-4" /> Join Room
                        </>
                      )}
                    </motion.button>
                  </div>
                </DialogContent>
              </Dialog>
            </motion.div>
          </motion.section>

          {/* Recent Rooms */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
              <Clock className="w-6 h-6 text-indigo-400" />
              Recent Rooms
            </h2>

            {loadingRooms ? (
              <LoadingState />
            ) : rooms.length === 0 ? (
              <EmptyState
                icon={Code2}
                title="No rooms yet"
                description="Create a new room or ask a friend to share theirs to get started."
                action={() => setIsCreateDialogOpen(true)}
                actionLabel="Create Your First Room"
              />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room, idx) => (
                  <motion.div
                    key={room.id}
                    variants={itemVariants}
                    whileHover={{ y: -8 }}
                    onClick={() => navigate(`/rooms/${room.id}`)}
                    className="group cursor-pointer rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/10 hover:border-indigo-500/40 p-6 transition-all duration-300 backdrop-blur-sm hover:shadow-2xl hover:shadow-indigo-500/20"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        {/* Language Badge */}
                        <div
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg mb-3 text-xs font-bold"
                          style={{
                            backgroundColor: `${langColors[room.language].bg}40`,
                            border: `1px solid ${langColors[room.language].bg}80`,
                          }}
                        >
                          <span
                            className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-black text-white"
                            style={{ backgroundColor: langColors[room.language].bg }}
                          >
                            {langColors[room.language].icon}
                          </span>
                          {langColors[room.language].label}
                        </div>
                      </div>

                      {/* More Actions */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyId(room.id);
                          }}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          {copiedId === room.id ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Room Title */}
                    <h3 className="text-lg font-bold text-white mb-3 truncate">
                      {room.name || `Room ${room.id.slice(0, 6)}`}
                    </h3>

                    {/* Info */}
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{room.participants || 1} participant</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(room.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Footer CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10 group-hover:opacity-100 opacity-70 transition-opacity">
                      <span className="text-xs text-indigo-400 font-semibold">Click to open</span>
                      <ExternalLink className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>
        </div>
      </main>
    </div>
  );
}
