import { socket } from '../lib/socket.ts';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { useAuth } from '../context/auth.context';
import { useRoom } from '../context/room.context';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Copy, Check, Users, MessageCircle, Code2, ChevronLeft, Send, Terminal, X, Loader2, Save, Wifi, WifiOff, Lock, Unlock } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { roomService } from '../lib/roomService';
import { executionService } from '../lib/executionService';

interface Message { id: string; userId: string; userName: string; content: string; timestamp: string; }
type TerminalLevel = 'info' | 'stdout' | 'stderr' | 'error' | 'system';
interface TerminalEntry { id: string; level: TerminalLevel; message: string; timestamp: string; }
interface NormalizedExecutionResult { stdout: string; stderr: string; exitCode: number | null; }

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentRoom, code, language, messages, updateCode, setLanguage, addMessage, setRoomMessages, joinRoom, leaveRoom } = useRoom();
  const { toast } = useToast();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isOutputOpen, setIsOutputOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [outputResult, setOutputResult] = useState<{
    stdout: string; stderr: string; exitCode: number | null;
    error: string | null; timestamp: string | null; language: string;
  } | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [outputCopied, setOutputCopied] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [terminalEntries, setTerminalEntries] = useState<TerminalEntry[]>([]);
  const [activeParticipants, setActiveParticipants] = useState<Array<{ id: string; name: string; avatarColor: string; isOnline: boolean }>>(
    currentRoom?.participants || [{ id: user?.id || '1', name: user?.name || 'You', avatarColor: user?.avatarColor || '#4F46E5', isOnline: true }]
  );
  const [isEditorLocked, setIsEditorLocked] = useState<boolean>(Boolean(currentRoom?.isLocked));
  const [teacherId, setTeacherId] = useState<string | null>(currentRoom?.teacherId || null);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const outputEndRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const isRemoteUpdate = useRef(false);
  const cursorDecorations = useRef<Map<string, string[]>>(new Map());
  const isJoiningRoom = useRef(false); // guard against re-entrant joinRoom calls
  const pendingEmitCodeRef = useRef<string | null>(null);
  const emitCodeTimerRef = useRef<number | null>(null);

  const isTeacher = Boolean(user?.id && teacherId && user.id === teacherId);
  const isStudentReadOnly = !isTeacher && isEditorLocked;

  const normalizeMessage = (raw: any): Message => ({
    id: raw?.id || `msg_${Date.now()}`,
    userId: raw?.userId || 'unknown',
    userName: raw?.userName || 'Unknown',
    content: raw?.content || '',
    timestamp: raw?.timestamp ? new Date(raw.timestamp).toISOString() : new Date().toISOString(),
  });

  const handleRemoteCursorUpdate = (remoteCursor: any) => {
    if (!editorRef.current || !monacoRef.current) return;
    const monaco = monacoRef.current;
    const editor = editorRef.current;
    const oldDecorations = cursorDecorations.current.get(remoteCursor.userId) || [];
    const newDecorations = [{ range: new monaco.Range(remoteCursor.lineNumber, remoteCursor.column, remoteCursor.lineNumber, remoteCursor.column + 1), options: { className: `remote-cursor-${remoteCursor.userId}`, beforeContentClassName: `remote-cursor-widget-${remoteCursor.userId}`, stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges, hoverMessage: { value: remoteCursor.name } } }];
    if (!document.getElementById(`style-${remoteCursor.userId}`)) {
      const style = document.createElement('style');
      style.id = `style-${remoteCursor.userId}`;
      style.innerHTML = `.remote-cursor-${remoteCursor.userId}{border-left:2px solid ${remoteCursor.color}!important}.remote-cursor-widget-${remoteCursor.userId}::after{content:'${remoteCursor.name}';position:absolute;top:-18px;left:0;background:${remoteCursor.color};color:white;font-size:10px;padding:0 4px;border-radius:2px;white-space:nowrap;font-weight:bold;pointer-events:none}`;
      document.head.appendChild(style);
    }
    const newIds = editor.deltaDecorations(oldDecorations, newDecorations);
    cursorDecorations.current.set(remoteCursor.userId, newIds);
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    editor.onDidChangeCursorPosition((e: any) => {
      if (!user) return;
      socket.emit('cursor-change', { roomId, cursorData: { userId: user.id || 'guest', name: user.name || 'Guest', color: user.avatarColor || '#4F46E5', lineNumber: e.position.lineNumber, column: e.position.column } });
    });
  };

  const queueCodeEmit = (nextCode: string) => {
    pendingEmitCodeRef.current = nextCode;
    if (emitCodeTimerRef.current !== null) {
      return;
    }

    emitCodeTimerRef.current = window.setTimeout(() => {
      const latestCode = pendingEmitCodeRef.current;
      pendingEmitCodeRef.current = null;
      emitCodeTimerRef.current = null;

      if (!latestCode) return;
      socket.emit('code-change', { roomId, code: latestCode, language, userId: user?.id, userName: user?.name });
    }, 35);
  };

  useEffect(() => {
    if (roomId && user) {
      socket.auth = { token: localStorage.getItem('token') };
      socket.connect();
      setIsConnected(true);
      socket.emit('join-room', { roomId, userId: user.id, userName: user.name, avatarColor: user.avatarColor || '#4F46E5' });
      socket.on('code-update', (updateData: any) => {
        const newCode = typeof updateData === 'string' ? updateData : updateData.code;
        if (editorRef.current && newCode !== editorRef.current.getValue()) {
          const model = editorRef.current.getModel();
          if (model) { isRemoteUpdate.current = true; editorRef.current.executeEdits('remote-sync', [{ range: model.getFullModelRange(), text: newCode, forceMoveMarkers: true }]); updateCode(newCode); isRemoteUpdate.current = false; }
        }
      });
      socket.on('cursor-update', (cursorData: any) => { if (cursorData.userId !== user.id) handleRemoteCursorUpdate(cursorData); });
      socket.on('participants-updated', ({ participants }: any) => setActiveParticipants(participants));
      socket.on('user-joined', (joinData: any) => { toast({ title: `${joinData.userName} joined the room`, duration: 2000 }); });
      socket.on('user-left', () => undefined);
      socket.on('language-update', (updateData: any) => { const newLang = typeof updateData === 'string' ? updateData : updateData.language; setLanguage(newLang); if (updateData.changedBy) toast({ title: `${updateData.changedBy.userName} changed language to ${newLang}`, duration: 2000 }); });
      socket.on('room-control-state', (state: any) => {
        if (state?.teacherId) {
          setTeacherId(String(state.teacherId));
        }
        if (typeof state?.isLocked === 'boolean') {
          setIsEditorLocked(state.isLocked);
        }
      });
      socket.on('room-lock-updated', (data: any) => {
        if (typeof data?.isLocked === 'boolean') {
          setIsEditorLocked(data.isLocked);
          toast({ title: data.isLocked ? 'Practice disabled by teacher' : 'Practice enabled for students', duration: 2000 });
        }
      });
      socket.on('room-chat-history', ({ messages: roomMessages }: any) => {
        const normalized = Array.isArray(roomMessages) ? roomMessages.map(normalizeMessage) : [];
        setRoomMessages(normalized);
      });
      socket.on('chat-message', (messageData: any) => {
        addMessage(normalizeMessage(messageData));
      });
      socket.on('participant-removed', (data: any) => {
        if (!data?.targetUserId) return;
        if (data.targetUserId === user.id) {
          toast({ title: 'You were removed from this room', description: `Removed by ${data.removedBy || 'teacher'}`, variant: 'destructive' });
          leaveRoom();
          navigate('/dashboard');
          return;
        }
        toast({ title: 'Participant removed', description: `${data.removedBy || 'Teacher'} removed a participant.` });
      });
      socket.on('removed-from-room', (data: any) => {
        toast({ title: 'Removed from room', description: `Removed by ${data?.removedBy || 'teacher'}`, variant: 'destructive' });
        leaveRoom();
        navigate('/dashboard');
      });
      return () => {
        socket.off('code-update'); socket.off('cursor-update'); socket.off('language-update'); socket.off('participants-updated'); socket.off('user-joined'); socket.off('user-left'); socket.off('room-control-state'); socket.off('room-lock-updated'); socket.off('room-chat-history'); socket.off('chat-message'); socket.off('participant-removed'); socket.off('removed-from-room');
        if (emitCodeTimerRef.current !== null) {
          window.clearTimeout(emitCodeTimerRef.current);
          emitCodeTimerRef.current = null;
        }
        pendingEmitCodeRef.current = null;
        socket.emit('leave-room', { roomId, userId: user.id }); socket.disconnect(); setIsConnected(false);
      };
    }
  }, [roomId, user]);

  useEffect(() => {
    if (!currentRoom) return;
    if (currentRoom.teacherId) {
      setTeacherId(currentRoom.teacherId);
    }
    if (typeof currentRoom.isLocked === 'boolean') {
      setIsEditorLocked(currentRoom.isLocked);
    }
  }, [currentRoom]);

  useEffect(() => {
    if (roomId && !currentRoom && !isJoiningRoom.current) {
      isJoiningRoom.current = true;
      joinRoom(roomId).finally(() => { isJoiningRoom.current = false; });
    }
  }, [roomId]); // intentionally narrow deps — prevents re-mount during execution
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { outputEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [terminalEntries, isExecuting]);

  const handleCopyRoomId = () => { navigator.clipboard.writeText(roomId || ''); setCopied(true); toast({ title: 'Room ID copied!' }); setTimeout(() => setCopied(false), 2000); };
  const getTimeStamp = () => new Date().toLocaleTimeString([], { hour12: false });
  const appendTerminalEntry = (level: TerminalLevel, message: string) => {
    setTerminalEntries((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        level,
        message,
        timestamp: getTimeStamp(),
      },
    ]);
  };
  const appendTerminalBlock = (level: TerminalLevel, block: string) => {
    const lines = block
      .split('\n')
      .map((line) => line.trimEnd())
      .filter((line) => line.length > 0);

    if (!lines.length) return;
    setTerminalEntries((prev) => [
      ...prev,
      ...lines.map((line) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        level,
        message: line,
        timestamp: getTimeStamp(),
      })),
    ]);
  };

  const normalizeExecutionResult = (res: any): NormalizedExecutionResult => {
    const directStdout = typeof res?.stdout === 'string' ? res.stdout : '';
    const directStderr = typeof res?.stderr === 'string' ? res.stderr : '';
    const nestedStdout = typeof res?.run?.stdout === 'string' ? res.run.stdout : '';
    const nestedStderr = typeof res?.run?.stderr === 'string' ? res.run.stderr : '';
    const outputField = typeof res?.output === 'string' ? res.output : '';
    const errorField = typeof res?.error === 'string' ? res.error : '';

    const normalizedStdout = (directStdout || nestedStdout || outputField || '').trimEnd();
    const normalizedStderr = (directStderr || nestedStderr || errorField || '').trimEnd();

    const maybeExitCode = res?.exitCode ?? res?.code ?? res?.run?.code ?? null;
    const normalizedExitCode = typeof maybeExitCode === 'number'
      ? maybeExitCode
      : Number.isFinite(Number(maybeExitCode))
        ? Number(maybeExitCode)
        : null;

    return {
      stdout: normalizedStdout,
      stderr: normalizedStderr,
      exitCode: normalizedExitCode,
    };
  };

  const handleExecute = async () => {
    // Always read live code from the editor ref — context `code` can lag behind
    const liveCode = editorRef.current
      ? editorRef.current.getValue()
      : code;

    if (!liveCode || !liveCode.trim()) {
      toast({ title: 'No code to execute', description: 'Write some code first.', variant: 'destructive' });
      return;
    }

    setIsExecuting(true);
    setIsOutputOpen(true);
    setOutputResult(null);
    setTerminalEntries([]);
    appendTerminalEntry('info', `Running ${language} code...`);

    try {
      const res = await executionService.execute({ code: liveCode, language });
      const normalized = normalizeExecutionResult(res);
      const cleanedStdout = normalized.stdout;
      const cleanedStderr = normalized.stderr;
      const resolvedExitCode = normalized.exitCode;

      if (!cleanedStdout && !cleanedStderr && typeof res === 'object' && res !== null) {
        appendTerminalBlock('system', JSON.stringify(res, null, 2));
      }

      if (cleanedStdout) appendTerminalBlock('stdout', cleanedStdout);
      if (cleanedStderr) appendTerminalBlock('stderr', cleanedStderr);
      if (!cleanedStdout && !cleanedStderr) appendTerminalEntry('system', 'Program exited with no output.');
      appendTerminalEntry(
        resolvedExitCode === 0 || resolvedExitCode === null ? 'system' : 'error',
        resolvedExitCode === null ? 'Execution completed.' : `Process exited with code ${resolvedExitCode}.`
      );

      setOutputResult({
        stdout: cleanedStdout,
        stderr: cleanedStderr,
        exitCode: resolvedExitCode,
        error: null,
        timestamp: getTimeStamp(),
        language,
      });
    } catch (error: any) {
      const msg = error?.response?.data?.error || error?.message || 'Execution failed';
      appendTerminalEntry('error', msg);
      appendTerminalEntry('error', 'Process exited with code 1.');
      setOutputResult({
        stdout: '', stderr: '', exitCode: 1,
        error: msg,
        timestamp: getTimeStamp(),
        language,
      });
    } finally {
      setIsExecuting(false);
    }
  };
  const handleSaveCode = async () => { try { if (!roomId) return; await roomService.saveCode({ roomId, code, language }); toast({ title: 'Code saved successfully' }); } catch { toast({ title: 'Failed to save code', variant: 'destructive' }); } };
  const handleSendMessage = () => {
    const content = newMessage.trim();
    if (!content || !roomId || !user?.id || !user?.name) return;

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    socket.emit('chat-message', {
      roomId,
      message: { id: messageId, content },
      userId: user.id,
      userName: user.name,
      avatarColor: user.avatarColor || '#4F46E5',
    });
    setNewMessage('');
  };
  const handleLeave = () => { leaveRoom(); navigate('/dashboard'); };
  const handleToggleLock = () => {
    if (!roomId || !isTeacher) return;
    socket.emit('lock-editor', { roomId, isLocked: !isEditorLocked });
  };
  const handleRemoveParticipant = () => {
    if (!roomId || !isTeacher || !selectedParticipantId) return;
    socket.emit('remove-participant', { roomId, targetUserId: selectedParticipantId });
    setSelectedParticipantId('');
  };

  const participants = activeParticipants && activeParticipants.length > 0 ? activeParticipants : [{ id: user?.id || '1', name: user?.name || 'You', avatarColor: user?.avatarColor || '#4F46E5', isOnline: true }];
  const removableParticipants = participants.filter((p) => p.id !== teacherId);
  const allMessages = messages
    .slice()
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0B0F19' }}>

      {/* ── HEADER ── */}
      <header style={{ height: '52px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', background: '#0D1117', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={handleLeave} style={{ width: '30px', height: '30px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(241,245,249,0.4)', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.15s' }} className="hover:text-white hover:bg-white/[0.06]">
            <ChevronLeft size={18} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Code2 size={15} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9', lineHeight: 1 }}>{currentRoom?.name || 'Coding Room'}</div>
              <button onClick={handleCopyRoomId} style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'JetBrains Mono, monospace', padding: 0, marginTop: '2px', transition: 'color 0.15s' }} className="hover:text-white/60">
                {roomId?.slice(0, 16)}… {copied ? <Check size={11} color="#34D399" /> : <Copy size={11} />}
              </button>
            </div>
          </div>
          {/* Connection */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 9px', borderRadius: '99px', fontSize: '11px', fontWeight: 600, background: isConnected ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: isConnected ? '#34D399' : '#F87171' }}>
            {isConnected ? <Wifi size={11} /> : <WifiOff size={11} />}
            {isConnected ? 'Live' : 'Offline'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ padding: '3px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 600, border: '1px solid rgba(255,255,255,0.08)', background: isEditorLocked ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)', color: isEditorLocked ? '#FCA5A5' : 'rgba(241,245,249,0.7)' }}>
              {isEditorLocked ? 'Practice Disabled' : 'Practice Enabled'}
            </span>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Participant avatars */}
          <div className="hidden sm:flex" style={{ alignItems: 'center', marginRight: '4px' }}>
            {participants.slice(0, 5).map((p, i) => (
              <div key={p.id} title={p.name} style={{ width: '26px', height: '26px', borderRadius: '50%', background: p.avatarColor, border: '2px solid #0D1117', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: '#fff', marginLeft: i > 0 ? '-7px' : 0, zIndex: 5 - i, position: 'relative' }}>
                {p.name.charAt(0).toUpperCase()}
                {p.isOnline && <span style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', border: '1.5px solid #0D1117' }} />}
              </div>
            ))}
            {participants.length > 5 && <span style={{ fontSize: '11px', color: '#6B7280', marginLeft: '7px' }}>+{participants.length - 5}</span>}
          </div>

          {/* Language selector */}
          <Select value={language} onValueChange={(v) => { setLanguage(v as 'javascript' | 'python'); socket.emit('language-change', { roomId, language: v, userId: user?.id, userName: user?.name }); }}>
            <SelectTrigger style={{ width: '130px', height: '32px', fontSize: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: '#f1f5f9' }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)' }}>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
            </SelectContent>
          </Select>

          {isTeacher && (
            <>
              <button
                onClick={handleToggleLock}
                style={{ height: '32px', padding: '0 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.04)', color: '#E2E8F0', border: '1px solid rgba(255,255,255,0.09)', cursor: 'pointer', transition: 'all 0.15s' }}
                className="hover:text-white hover:border-white/20 hover:bg-white/[0.07]"
              >
                {isEditorLocked ? <Unlock size={13} /> : <Lock size={13} />}
                {isEditorLocked ? 'Enable Practice' : 'Disable Practice'}
              </button>
              <select
                value={selectedParticipantId}
                onChange={(e) => setSelectedParticipantId(e.target.value)}
                style={{ height: '32px', minWidth: '170px', padding: '0 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 500, background: 'rgba(255,255,255,0.04)', color: '#E2E8F0', border: '1px solid rgba(255,255,255,0.09)', outline: 'none' }}
              >
                <option value="" style={{ background: '#0D1117', color: '#94A3B8' }}>Select participant</option>
                {removableParticipants.map((participant) => (
                  <option key={participant.id} value={participant.id} style={{ background: '#0D1117', color: '#E2E8F0' }}>
                    {participant.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleRemoveParticipant}
                disabled={!selectedParticipantId}
                style={{ height: '32px', padding: '0 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', background: 'rgba(239,68,68,0.18)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.35)', cursor: selectedParticipantId ? 'pointer' : 'not-allowed', opacity: selectedParticipantId ? 1 : 0.55, transition: 'all 0.15s' }}
              >
                Remove Participant
              </button>
            </>
          )}

          {/* Run */}
          <button onClick={handleExecute} disabled={isExecuting}
            style={{ height: '32px', padding: '0 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', background: '#059669', color: '#fff', border: 'none', cursor: 'pointer', opacity: isExecuting ? 0.7 : 1, transition: 'all 0.15s' }}
            className="hover:bg-emerald-500"
          >
            {isExecuting ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} fill="white" />}
            <span className="hidden sm:inline">{isExecuting ? 'Running…' : 'Run'}</span>
          </button>

          {/* Save */}
          <button onClick={handleSaveCode}
            style={{ height: '32px', padding: '0 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.04)', color: 'rgba(241,245,249,0.6)', border: '1px solid rgba(255,255,255,0.09)', cursor: 'pointer', transition: 'all 0.15s' }}
            className="hover:text-white hover:border-white/20 hover:bg-white/[0.07]"
          >
            <Save size={13} />
            <span className="hidden sm:inline">Save</span>
          </button>

          {/* Chat toggle */}
          <button onClick={() => setIsChatOpen(!isChatOpen)}
            style={{ height: '32px', width: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', border: isChatOpen ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.09)', background: isChatOpen ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)', color: isChatOpen ? '#818CF8' : 'rgba(241,245,249,0.45)', cursor: 'pointer', transition: 'all 0.15s' }}
          >
            <MessageCircle size={15} />
            {allMessages.length > 0 && !isChatOpen && (
              <span style={{ position: 'absolute', top: '-5px', right: '-5px', width: '16px', height: '16px', borderRadius: '50%', background: '#4F46E5', color: '#fff', fontSize: '9px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {allMessages.length > 9 ? '9+' : allMessages.length}
              </span>
            )}
          </button>

          <button className="sm:hidden" style={{ height: '32px', width: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(241,245,249,0.45)', cursor: 'pointer' }}>
            <Users size={15} />
          </button>
        </div>
      </header>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Editor column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Editor
              height="100%"
              language={language}
              value={code}
              onMount={handleEditorDidMount}
              onChange={(value) => {
                if (isStudentReadOnly) return;
                if (value !== undefined && !isRemoteUpdate.current) {
                  updateCode(value);
                  queueCodeEmit(value);
                }
              }}
              theme="vs-dark"
              options={{ readOnly: isStudentReadOnly, fontSize: 14, fontFamily: 'JetBrains Mono, monospace', fontLigatures: true, minimap: { enabled: false }, padding: { top: 18, bottom: 18 }, scrollBeyondLastLine: false, automaticLayout: true, tabSize: 2, wordWrap: 'on', lineNumbersMinChars: 3, renderLineHighlight: 'gutter', cursorBlinking: 'smooth', smoothScrolling: true }}
            />
          </div>

          {/* ── OUTPUT PANEL ── */}
          <AnimatePresence>
            {isOutputOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                style={{ flexShrink: 0, borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', background: '#020617', minHeight: '140px', maxHeight: '320px' }}
              >
                {/* Panel header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0, background: '#0D1117' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Terminal size={13} color="#34D399" />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#34D399', fontFamily: 'JetBrains Mono, monospace' }}>Output</span>
                    {/* Status badge */}
                    {isExecuting ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', fontWeight: 600, color: '#FBBF24', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', padding: '2px 8px', borderRadius: '99px' }}>
                        <Loader2 size={9} className="animate-spin" /> Running
                      </span>
                    ) : outputResult ? (
                      outputResult.error ? (
                        <span style={{ fontSize: '10px', fontWeight: 600, color: '#F87171', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '2px 8px', borderRadius: '99px' }}>Error</span>
                      ) : outputResult.exitCode !== 0 && outputResult.exitCode != null ? (
                        <span style={{ fontSize: '10px', fontWeight: 600, color: '#FBBF24', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', padding: '2px 8px', borderRadius: '99px' }}>Exit {outputResult.exitCode}</span>
                      ) : (
                        <span style={{ fontSize: '10px', fontWeight: 600, color: '#34D399', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '2px 8px', borderRadius: '99px' }}>Success</span>
                      )
                    ) : null}
                    {outputResult?.timestamp && (
                      <span style={{ fontSize: '10px', color: '#374151', fontFamily: 'JetBrains Mono, monospace' }}>{outputResult.timestamp}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {/* Copy button */}
                    {outputResult && (
                      <button
                        onClick={() => {
                          const text = [outputResult.stdout, outputResult.stderr, outputResult.error].filter(Boolean).join('\n');
                          navigator.clipboard.writeText(text);
                          setOutputCopied(true);
                          setTimeout(() => setOutputCopied(false), 2000);
                        }}
                        title="Copy output"
                        style={{ height: '22px', padding: '0 8px', borderRadius: '5px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 500, color: 'rgba(255,255,255,0.3)', background: 'transparent', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', transition: 'all 0.15s' }}
                        className="hover:text-white/60 hover:border-white/20"
                      >
                        {outputCopied ? <Check size={10} color="#34D399" /> : <Copy size={10} />}
                        {outputCopied ? 'Copied' : 'Copy'}
                      </button>
                    )}
                    <button onClick={() => setIsOutputOpen(false)}
                      style={{ width: '22px', height: '22px', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.25)', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}
                      className="hover:text-white/60 hover:bg-white/[0.05]"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>

                {/* Panel body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {isExecuting ? (
                    /* Running state */
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#FBBF24', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Executing {language} code…</span>
                    </div>
                  ) : terminalEntries.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {terminalEntries.map((entry) => {
                        const metaColor = entry.level === 'stderr' || entry.level === 'error'
                          ? '#FCA5A5'
                          : entry.level === 'stdout'
                            ? '#6EE7B7'
                            : '#93C5FD';
                        const textColor = entry.level === 'stderr' || entry.level === 'error' ? '#FECACA' : '#E5E7EB';
                        const label = entry.level.toUpperCase();

                        return (
                          <div
                            key={entry.id}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '88px 62px 1fr',
                              gap: '10px',
                              alignItems: 'start',
                              fontFamily: 'JetBrains Mono, monospace',
                              fontSize: '12px',
                              lineHeight: 1.6,
                            }}
                          >
                            <span style={{ color: '#64748B' }}>[{entry.timestamp}]</span>
                            <span style={{ color: metaColor, fontWeight: 700 }}>{label}</span>
                            <span style={{ color: textColor, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{entry.message}</span>
                          </div>
                        );
                      })}
                      <div ref={outputEndRef} />
                    </div>
                  ) : (
                    /* Initial idle state */
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}>
                      <span style={{ color: '#34D399' }}>$</span>
                      <span>Press <strong style={{ color: 'rgba(255,255,255,0.4)' }}>Run</strong> to execute your code…</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Chat panel */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.aside initial={{ width: 0, opacity: 0 }} animate={{ width: 300, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.22, ease: 'easeOut' }}
              style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', borderLeft: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', background: '#111827' }}
            >
              {/* Chat header */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageCircle size={15} color="#818CF8" />
                  <span style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '13px' }}>Team Chat</span>
                  {allMessages.length > 0 && (
                    <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '99px', background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', fontWeight: 600 }}>{allMessages.length}</span>
                  )}
                </div>
                <button onClick={() => setIsChatOpen(false)} style={{ width: '26px', height: '26px', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.15s' }} className="hover:text-white/70 hover:bg-white/[0.05]">
                  <X size={14} />
                </button>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {allMessages.length === 0 ? (
                  <div style={{ textAlign: 'center', paddingTop: '48px' }}>
                    <MessageCircle size={32} color="rgba(255,255,255,0.08)" style={{ margin: '0 auto 10px' }} />
                    <p style={{ fontSize: '13px', color: '#4B5563' }}>No messages yet</p>
                    <p style={{ fontSize: '12px', color: '#374151', marginTop: '4px' }}>Start the conversation!</p>
                  </div>
                ) : allMessages.map((msg) => {
                  const isOwn = msg.userId === user?.id;
                  return (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      style={{ display: 'flex', gap: '8px', flexDirection: isOwn ? 'row-reverse' : 'row' }}
                    >
                      <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: participants.find(p => p.id === msg.userId)?.avatarColor || '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: '#fff', flexShrink: 0, alignSelf: 'flex-end' }}>
                        {msg.userName?.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', gap: '3px', alignItems: isOwn ? 'flex-end' : 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          {!isOwn && <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(241,245,249,0.5)' }}>{msg.userName}</span>}
                          <span style={{ fontSize: '10px', color: '#374151' }}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div style={{ padding: '8px 12px', borderRadius: isOwn ? '14px 14px 4px 14px' : '14px 14px 14px 4px', fontSize: '13px', lineHeight: 1.5, background: isOwn ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.05)', border: isOwn ? '1px solid rgba(99,102,241,0.28)' : '1px solid rgba(255,255,255,0.07)', color: isOwn ? '#c7d2fe' : 'rgba(241,245,249,0.85)' }}>
                          {msg.content}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} style={{ display: 'flex', gap: '8px' }}>
                  <input placeholder="Type a message…" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                    style={{ flex: 1, padding: '9px 12px', borderRadius: '10px', fontSize: '13px', color: '#f1f5f9', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', outline: 'none', transition: 'all 0.15s', fontFamily: 'Inter, system-ui, sans-serif' }}
                    className="placeholder:text-white/25 focus:border-indigo-500/50 focus:bg-white/[0.06]"
                  />
                  <button type="submit" disabled={!newMessage.trim()}
                    style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: newMessage.trim() ? '#4F46E5' : 'rgba(255,255,255,0.04)', border: 'none', cursor: newMessage.trim() ? 'pointer' : 'not-allowed', opacity: newMessage.trim() ? 1 : 0.4, transition: 'all 0.15s', flexShrink: 0 }}
                  >
                    <Send size={14} color="white" />
                  </button>
                </form>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
