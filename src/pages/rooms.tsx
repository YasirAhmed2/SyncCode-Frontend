import { socket } from '../lib/socket.ts';



import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../context/auth.context';
import { useRoom } from '../context/room.context';
import { motion } from 'framer-motion';
import {
  Play,
  Copy,
  Check,
  Users,
  MessageCircle,
  Code2,
  ChevronLeft,
  Send,
  Terminal,
  X,
  Loader2,
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { roomService } from '../lib/roomService';
import api from '../lib/api';

export default function Room() {
  // const socket=io('http://localhost:5000', {
  // withCredentials: true
  // });
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    currentRoom,
    code,
    language,
    messages,
    updateCode,
    setLanguage,
    sendMessage,
    joinRoom,
    leaveRoom
  } = useRoom();
  const { toast } = useToast();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isOutputOpen, setIsOutputOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [output, setOutput] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [copied, setCopied] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const isRemoteUpdate = useRef(false);
  const cursorDecorations = useRef<Map<string, string[]>>(new Map());

  // Handle Remote Cursor Rendering
  const handleRemoteCursorUpdate = (remoteCursor: any) => {
    if (!editorRef.current || !monacoRef.current) return;
    const monaco = monacoRef.current;
    const editor = editorRef.current;

    const oldDecorations = cursorDecorations.current.get(remoteCursor.userId) || [];

    const newDecorations = [
      {
        range: new monaco.Range(remoteCursor.lineNumber, remoteCursor.column, remoteCursor.lineNumber, remoteCursor.column + 1),
        options: {
          className: `remote-cursor-${remoteCursor.userId}`,
          beforeContentClassName: `remote-cursor-widget-${remoteCursor.userId}`,
          stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
          hoverMessage: { value: remoteCursor.name }
        }
      }
    ];

    // Inject CSS if needed (idempotent check)
    if (!document.getElementById(`style-${remoteCursor.userId}`)) {
      const style = document.createElement('style');
      style.id = `style-${remoteCursor.userId}`;
      style.innerHTML = `
                .remote-cursor-${remoteCursor.userId} {
                border-left: 2px solid ${remoteCursor.color} !important;
                }
                .remote-cursor-widget-${remoteCursor.userId}::after {
                content: '${remoteCursor.name}';
                position: absolute;
                top: -18px;
                left: 0;
                background: ${remoteCursor.color};
                color: white;
                font-size: 10px;
                padding: 0 4px;
                border-radius: 2px;
                white-space: nowrap;
                font-weight: bold;
                pointer-events: none;
                }
            `;
      document.head.appendChild(style);
    }

    const newIds = editor.deltaDecorations(oldDecorations, newDecorations);
    cursorDecorations.current.set(remoteCursor.userId, newIds);
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Listen for cursor movements to broadcast
    editor.onDidChangeCursorPosition((e: any) => {
      if (!user) return;
      const cursorData = {
        userId: user.id || 'guest',
        name: user.name || 'Guest',
        color: user.avatarColor || '#f59e0b',
        lineNumber: e.position.lineNumber,
        column: e.position.column
      };
      socket.emit('cursor-change', { roomId, cursorData });
    });
  };

  useEffect(() => {
    if (roomId && user) {
      socket.auth = { token: localStorage.getItem('token') };
      socket.connect();
      socket.emit('join-room', { roomId, userId: user.id, userName: user.name });

      socket.on('code-update', (newCode: string) => {
        if (editorRef.current && newCode !== editorRef.current.getValue()) {
          const model = editorRef.current.getModel();
          if (model) {
            isRemoteUpdate.current = true;
            const fullRange = model.getFullModelRange();
            editorRef.current.executeEdits('remote-sync', [{
              range: fullRange,
              text: newCode,
              forceMoveMarkers: true
            }]);
            updateCode(newCode); // Update context state
            isRemoteUpdate.current = false;
          }
        }
      });

      socket.on('cursor-update', (cursorData: any) => {
        if (cursorData.userId !== user.id) {
          handleRemoteCursorUpdate(cursorData);
        }
      });

      socket.on('user-joined', () => {
        joinRoom(roomId);
        toast({ title: 'A user joined the room' });
      });

      socket.on('language-update', (newLang: 'javascript' | 'python') => {
        setLanguage(newLang);
      });

      return () => {
        socket.off('code-update');
        socket.off('cursor-update');
        socket.off('language-update');
        socket.emit('leave-room', { roomId });
        socket.disconnect();
      }
    }
  }, [roomId, user]); // Re-subscribe if room or user changes

  useEffect(() => {
    if (roomId && !currentRoom) {
      joinRoom(roomId);
    }
  }, [roomId, currentRoom, joinRoom]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId || '');
    setCopied(true);
    toast({ title: 'Room ID copied!' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecute = async () => {
    if (!code.trim()) {
      toast({ title: 'No code to execute', variant: 'destructive' });
      return;
    }

    setIsExecuting(true);
    setIsOutputOpen(true);
    setOutput('Running...\n');

    try {
      const res = await api.post(
        '/execute',
        {
          code,
          language
        }
      );

      setOutput(res.data.stdout || 'No output');
    } catch (error: any) {
      setOutput(
        error?.response?.data?.error || 'Execution failed'
      );
    } finally {
      setIsExecuting(false);
    }
  };


  const handleSaveCode = async () => {
    try {
      console.log('Saving code...', { code, language });
      console.log('Room ID:', roomId);
      if (!roomId) return;

      await roomService.saveCode({
        roomId,
        code,
        language
      });

      toast({ title: 'Code saved successfully' });
    } catch (error) {
      toast({
        title: 'Failed to save code',
        variant: 'destructive',
      });
    }
  };


  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    sendMessage(newMessage);
    setNewMessage('');
  };

  const handleLeave = () => {
    leaveRoom();
    navigate('/dashboard');
  };

  const participants = currentRoom?.participants || [
    { id: '1', name: user?.name || 'You', avatarColor: user?.avatarColor || '#00D9FF', isOnline: true },
  ];

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-white/5 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleLeave}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Code2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground text-sm">
                {currentRoom?.name || 'Coding Room'}
              </h1>
              <button
                onClick={handleCopyRoomId}
                className="text-xs text-muted-foreground hover:text-foreground font-mono flex items-center gap-1"
              >
                {roomId?.slice(0, 15)}...
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Participants */}
          <div className="hidden sm:flex items-center gap-1">
            {participants.slice(0, 4).map((p, i) => (
              <div
                key={p.id}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 border-background"
                style={{
                  backgroundColor: p.avatarColor,
                  marginLeft: i > 0 ? '-8px' : '0',
                  zIndex: 4 - i,
                }}
                title={p.name}
              >
                {p.name.charAt(0).toUpperCase()}
              </div>
            ))}
            {participants.length > 4 && (
              <span className="text-xs text-muted-foreground ml-2">
                +{participants.length - 4}
              </span>
            )}
          </div>

          {/* Language Selector */}
          <Select value={language} onValueChange={(v) => setLanguage(v as 'javascript' | 'python')}>
            <SelectTrigger className="w-32 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
            </SelectContent>
          </Select>

          {/* Run Button */}
          <Button onClick={handleExecute} disabled={isExecuting} className="gap-2">
            {isExecuting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Run</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleSaveCode}
            className="gap-2"
          >
            <Check className="w-4 h-4" />
            <span className="hidden sm:inline">Save</span>
          </Button>


          {/* Chat Toggle */}
          <Button
            variant={isChatOpen ? 'default' : 'outline'}
            size="icon"
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="relative"
          >
            <MessageCircle className="w-4 h-4" />
            {messages.length > 0 && !isChatOpen && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-[10px] flex items-center justify-center">
                {messages.length}
              </span>
            )}
          </Button>

          {/* Participants Toggle (Mobile) */}
          <Button variant="outline" size="icon" className="sm:hidden">
            <Users className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code Editor */}
        <div className="flex-1 flex flex-col">
          <Editor
            height="100%"
            language={language}
            value={code}
            onMount={handleEditorDidMount}
            onChange={(value) => {
              if (value !== undefined) {
                if (!isRemoteUpdate.current) {
                  updateCode(value);
                  socket.emit('code-change', { roomId, code: value, language });
                }
              }
            }}
            theme="vs-dark"
            options={{
              fontSize: 14,
              fontFamily: 'JetBrains Mono, monospace',
              minimap: { enabled: false },
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
            }}
          />

          {/* Output Panel */}
          {isOutputOpen && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 200 }}
              exit={{ height: 0 }}
              className="border-t border-white/10 bg-white/5 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Terminal className="w-4 h-4" />
                  Output
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOutputOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <pre className="p-4 text-sm font-mono text-foreground overflow-auto h-[150px]">
                {output || 'No output yet. Run your code to see results.'}
              </pre>
            </motion.div>
          )}
        </div>

        {/* Chat Panel */}
        {isChatOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-l border-white/10 bg-white/5 backdrop-blur-xl flex flex-col shrink-0"
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Chat</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsChatOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-8">
                  No messages yet. Start the conversation!
                </p>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-primary">{msg.userName}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground bg-secondary rounded-lg px-3 py-2">
                      {msg.content}
                    </p>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.aside>
        )}
      </div>
    </div>
  );
}
