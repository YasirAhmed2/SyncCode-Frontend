import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Navbar } from '../components/navbar';
import { useAuth } from '../context/auth.context';
import { useRoom } from '../context/room.context';
import { motion } from 'framer-motion';
import { Plus, Users, ArrowRight, Clock, Code2, LogIn, Languages } from 'lucide-react';
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
// import axios from 'axios'; // Removed unused import
import { roomService } from '../lib/roomService';
import { useEffect } from 'react';


export default function Dashboard() {
  const { user } = useAuth();
  // We'll ignore `rooms` from context for dashboard display and fetch fresh from API
  // const { rooms, joinRoom } = useRoom(); 
  const { joinRoom, createRoom } = useRoom();
  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    // Fetch recent rooms
    const fetchRooms = async () => {
      try {

        const res = await roomService.getMyRooms();
        if (res.success) {
          setRooms(res.rooms);
        }
      } catch (e) {
        console.error("Failed to fetch rooms", e);
      }
    }
    fetchRooms();
  }, []);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  // const [newRoomName, setNewRoomName] = useState('');
  const [language, setLanguage] = useState<'javascript' | 'python'>('javascript');

  const [joinRoomId, setJoinRoomId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateRoom = async () => {

    setIsLoading(true);

    try {
      // Use createRoom from context to ensure state is updated locally immediately
      const newRoom = await createRoom(language);

      toast({
        title: 'Room created!',
        description: `"${newRoom.id}" is ready for collaboration.`,
      });
      setIsCreateDialogOpen(false);
      // setNewRoomName('');

      console.log("Created room data (context):", newRoom);
      navigate(`/room/${newRoom.id}`);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Failed to create room',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!joinRoomId.trim()) return;
    setIsLoading(true);

    try {
      await joinRoom(joinRoomId);
      toast({
        title: 'Joined room!',
        description: 'You are now in the coding session.',
      });
      setIsJoinDialogOpen(false);
      setJoinRoomId('');
      navigate(`/room/${joinRoomId}`);
    } catch (error) {
      toast({
        title: 'Failed to join room',
        description: 'Room not found or access denied.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">

          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Welcome back,{" "}
              <span className="text-gradient">
                {user?.name || "Developer"}
              </span>
            </h1>
            <p className="text-muted-foreground">
              Create a new room or join an existing one to start collaborating.
            </p>
          </motion.div>

          {/* Action Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid sm:grid-cols-2 gap-6 mb-12"
          >

            {/* CREATE ROOM */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <div className="group cursor-pointer p-6 rounded-2xl bg-gradient-secondary border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow">
                  <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Plus className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Create New Room
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Start a new coding session and invite collaborators.
                  </p>
                  <span className="inline-flex items-center gap-2 text-primary font-medium">
                    Create Room <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </DialogTrigger>

              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Create New Room</DialogTitle>
                  <DialogDescription>
                    Select a programming language to continue.
                  </DialogDescription>
                </DialogHeader>

                {/* Language Selection */}
                <div className="space-y-3 pt-4">
                  <label className="text-sm font-medium">
                    Select Language
                  </label>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setLanguage("javascript")}
                      className={`px-4 py-2 rounded-lg border transition ${language === "javascript"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background"
                        }`}
                    >
                      JavaScript
                    </button>

                    <button
                      type="button"
                      onClick={() => setLanguage("python")}
                      className={`px-4 py-2 rounded-lg border transition ${language === "python"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background"
                        }`}
                    >
                      Python
                    </button>
                  </div>
                </div>

                <Button
                  onClick={handleCreateRoom}
                  variant="hero"
                  className="w-full mt-6"
                  disabled={!language || isLoading}
                >
                  {isLoading ? "Creating..." : "Create Room"}
                </Button>
              </DialogContent>
            </Dialog>

            {/* JOIN ROOM */}
            <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
              <DialogTrigger asChild>
                <div className="group cursor-pointer p-6 rounded-2xl bg-card border border-border hover:border-accent/50 transition-all duration-300 hover:shadow-glow">
                  <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <LogIn className="w-7 h-7 text-accent-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Join Room
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Enter a room ID to join an existing session.
                  </p>
                  <span className="inline-flex items-center gap-2 text-accent font-medium">
                    Join Room <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </DialogTrigger>

              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Join Room</DialogTitle>
                  <DialogDescription>
                    Enter the room ID shared with you.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomId">Room ID</Label>
                    <Input
                      id="roomId"
                      placeholder="room_xxxxxx"
                      value={joinRoomId}
                      onChange={(e) => setJoinRoomId(e.target.value)}
                      className="font-mono"
                    />
                  </div>

                  <Button
                    onClick={handleJoinRoom}
                    variant="hero"
                    className="w-full"
                    disabled={!joinRoomId.trim() || isLoading}
                  >
                    {isLoading ? "Joining..." : "Join Room"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

          </motion.div>

          {/* RECENT ROOMS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold mb-6">Recent Rooms</h2>

            {/* We will load real rooms here */}
            {rooms.length === 0 ? (
              <div className="text-center py-16 rounded-2xl border border-dashed">
                <Code2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-6">
                  No rooms yet. Create one to get started.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Room
                </Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rooms.map((room: any) => (
                  <div
                    key={room.roomId || room.id}
                    onClick={() => navigate(`/room/${room.roomId || room.id}`)}
                    className="cursor-pointer p-5 rounded-xl bg-card border hover:border-primary transition"
                  >
                    <h3 className="font-semibold mb-2">
                      {room.language ? room.language.toUpperCase() : 'CODE'}
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono">
                      {room.roomId || room.id}
                    </p>
                    <div className='mt-2 flex items-center gap-1 text-xs text-muted-foreground'>
                      <Clock className="w-3 h-3" />
                      {new Date(room.updatedAt || Date.now()).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

        </div>
      </main>
    </div>
  );
}