import { socket } from '../lib/socket.ts';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';
import { Awareness, applyAwarenessUpdate, encodeAwarenessUpdate } from 'y-protocols/awareness';
import { MonacoBinding } from 'y-monaco';
import { useAuth } from '../context/auth.context';
import { useRoom } from '../context/room.context';
import { useTheme } from '../context/theme.context';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Copy, Check, Users, MessageCircle, Code2, ChevronLeft, Send, Terminal, X, Loader2, Save, Wifi, WifiOff, Lock, Unlock, FileBarChart2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { roomService } from '../lib/roomService';
import { executionService } from '../lib/executionService';
import { ThemeToggle } from '../components/theme-toggle';
import { CODE_FIELD, encodeYDocState, normalizeBinaryUpdate } from '../lib/yjs';

interface Message { id: string; userId: string; userName: string; content: string; timestamp: string; }
type ActivityStatus = 'active' | 'idle' | 'inactive';

interface ActivitySnapshot {
  status: ActivityStatus;
  lastActive: number;
}

type TerminalLevel = 'info' | 'stdout' | 'stderr' | 'error' | 'system';
interface TerminalEntry { id: string; level: TerminalLevel; message: string; timestamp: string; }
interface NormalizedExecutionResult { stdout: string; stderr: string; exitCode: number | null; }

const REMOTE_SYNC_ORIGIN = 'socket-remote';
const INITIAL_SYNC_ORIGIN = 'socket-init';

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentRoom, code, language, messages, updateCode, setLanguage, addMessage, setRoomMessages, joinRoom, leaveRoom } = useRoom();
  const { toast } = useToast();
  const { isDarkMode } = useTheme();

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
  const [roomMode, setRoomMode] = useState<'broadcast' | 'practice'>(currentRoom?.mode === 'practice' ? 'practice' : 'broadcast');
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>('');
  const [activityMap, setActivityMap] = useState<Record<string, ActivitySnapshot>>({});
  const [cursorPositions, setCursorPositions] = useState<Record<string, { lineNumber: number; column: number; name: string }>>({}); // track where each participant's cursor is
  const [typingUsers, setTypingUsers] = useState<Record<string, { name: string }>>({});

  const chatEndRef = useRef<HTMLDivElement>(null);
  const outputEndRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const ydocRef = useRef<Y.Doc | null>(null);
  const yTextRef = useRef<Y.Text | null>(null);
  const awarenessRef = useRef<Awareness | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);
  const isJoiningRoom = useRef(false); // guard against re-entrant joinRoom calls
  const typingStopTimerRef = useRef<number | null>(null);
  const typingResetTimersRef = useRef<Record<string, number>>({});
  const awarenessTypingTimerRef = useRef<number | null>(null);
  const editorSecurityDisposablesRef = useRef<Array<{ dispose: () => void }>>([]);
  const roomModeRef = useRef<'broadcast' | 'practice'>(roomMode);
  const isTeacherRef = useRef<boolean>(false);
  const blockedClipboardToastTsRef = useRef<number>(0);
  const personalSubmissionCodeRef = useRef<string>('');
  const languageRef = useRef<'javascript' | 'python'>(language);

  const isTeacher = Boolean(user?.id && teacherId && user.id === teacherId);
  const isPracticeEnabled = roomMode === 'practice';
  const isStudentReadOnly = !isTeacher && roomMode === 'broadcast';
  const isEditorReadOnly = isStudentReadOnly;

  const normalizeMessage = (raw: any): Message => ({
    id: raw?.id || `msg_${Date.now()}`,
    userId: raw?.userId || 'unknown',
    userName: raw?.userName || 'Unknown',
    content: raw?.content || '',
    timestamp: raw?.timestamp ? new Date(raw.timestamp).toISOString() : new Date().toISOString(),
  });

  const emitUserActivity = () => {
    if (!roomId || !user?.id) return;
    // Suppress activity emission for teachers and when practice is disabled
    if (isTeacher || roomMode !== 'practice') return;
    socket.emit('user-activity', { roomId, userId: user.id, source: "local" });
  };

  const emitTypingActivity = () => {
    if (!roomId || !user?.id) return;

    // Skip activity for teachers or when practice is disabled
    if (isTeacher || roomMode !== 'practice') return;
    socket.emit('user-typing', { roomId, userId: user.id, source: "local" });
    socket.emit('user-activity', { roomId, userId: user.id, source: "local" });
    if (typingStopTimerRef.current !== null) {
      window.clearTimeout(typingStopTimerRef.current);
    }
    typingStopTimerRef.current = window.setTimeout(() => {
      socket.emit('user-stop-typing', { roomId, userId: user.id, source: "local" });
      typingStopTimerRef.current = null;
    }, 1500);
  };

  const formatLastActive = (lastActive: number) => {
    if (!lastActive) return 'No recent activity';

    const seconds = Math.max(0, Math.round((Date.now() - lastActive) / 1000));
    if (seconds < 60) {
      return `${seconds}s ago`;
    }

    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  const applyDeltaToPersonalCode = (current: string, delta: Array<any>) => {
    let next = current;
    let cursor = 0;

    for (const op of delta) {
      if (typeof op?.retain === 'number') {
        cursor = Math.max(0, Math.min(next.length, cursor + op.retain));
        continue;
      }

      if (typeof op?.insert === 'string' && op.insert.length > 0) {
        const pos = Math.max(0, Math.min(next.length, cursor));
        next = `${next.slice(0, pos)}${op.insert}${next.slice(pos)}`;
        cursor = pos + op.insert.length;
        continue;
      }

      if (typeof op?.delete === 'number' && op.delete > 0) {
        const pos = Math.max(0, Math.min(next.length, cursor));
        next = `${next.slice(0, pos)}${next.slice(pos + op.delete)}`;
      }
    }

    return next;
  };

  const syncPresenceFromAwareness = () => {
    const awareness = awarenessRef.current;
    if (!awareness) return;

    const nextCursorPositions: Record<string, { lineNumber: number; column: number; name: string }> = {};
    const nextTypingUsers: Record<string, { name: string }> = {};

    awareness.getStates().forEach((state: any) => {
      const presenceUser = state?.user;
      if (!presenceUser?.id) return;

      if (state.cursor && typeof state.cursor.lineNumber === 'number' && typeof state.cursor.column === 'number') {
        nextCursorPositions[presenceUser.id] = {
          lineNumber: state.cursor.lineNumber,
          column: state.cursor.column,
          name: presenceUser.name || 'Unknown',
        };
      }

      if (state.typing && presenceUser.id !== user?.id) {
        nextTypingUsers[presenceUser.id] = { name: presenceUser.name || 'Unknown' };
      }
    });

    setCursorPositions(nextCursorPositions);
    setTypingUsers(nextTypingUsers);
  };

  const refreshLocalPresence = (patch: Record<string, unknown>) => {
    const awareness = awarenessRef.current;
    if (!awareness || !user) return;

    awareness.setLocalState({
      ...awareness.getLocalState(),
      user: {
        id: user.id,
        name: user.name,
        color: user.avatarColor || '#4F46E5',
      },
      ...patch,
    });
  };

  const setLocalTypingPresence = () => {
    refreshLocalPresence({ typing: true });
    if (awarenessTypingTimerRef.current !== null) {
      window.clearTimeout(awarenessTypingTimerRef.current);
    }

    awarenessTypingTimerRef.current = window.setTimeout(() => {
      refreshLocalPresence({ typing: false });
      awarenessTypingTimerRef.current = null;
    }, 1500);
  };

  const bindMonacoToYjs = () => {
    if (!editorRef.current || !yTextRef.current || !awarenessRef.current) {
      return;
    }

    const model = editorRef.current.getModel();
    if (!model) {
      return;
    }

    bindingRef.current?.destroy();
    bindingRef.current = new MonacoBinding(
      yTextRef.current,
      model,
      new Set([editorRef.current]),
      awarenessRef.current
    );
  };

  const destroyYjsBinding = () => {
    bindingRef.current?.destroy();
    bindingRef.current = null;
    awarenessRef.current?.destroy();
    awarenessRef.current = null;
    ydocRef.current?.destroy();
    ydocRef.current = null;
    yTextRef.current = null;
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    bindMonacoToYjs();

    editorSecurityDisposablesRef.current.forEach((disposable) => disposable.dispose());
    editorSecurityDisposablesRef.current = [];

    const shouldBlockClipboard = () => !isTeacherRef.current && roomModeRef.current === 'practice';
    const showClipboardBlockedToast = () => {
      const now = Date.now();
      if (now - blockedClipboardToastTsRef.current < 1500) return;
      blockedClipboardToastTsRef.current = now;
      toast({
        title: 'Copy and paste are disabled in practice mode',
        description: 'Practice mode only allows original typing for students.',
        variant: 'destructive',
      });
    };

    const keyDisposable = editor.onKeyDown((e: any) => {
      if (!shouldBlockClipboard()) return;

      const isMeta = e.ctrlKey || e.metaKey;
      const isBlockedShortcut = isMeta && (
        e.keyCode === monaco.KeyCode.KeyC ||
        e.keyCode === monaco.KeyCode.KeyV ||
        e.keyCode === monaco.KeyCode.KeyX ||
        (e.keyCode === monaco.KeyCode.Insert && e.shiftKey)
      );

      if (!isBlockedShortcut) return;

      e.preventDefault();
      e.stopPropagation();
      showClipboardBlockedToast();
    });
    editorSecurityDisposablesRef.current.push(keyDisposable);

    const domNode = editor.getDomNode();
    if (domNode) {
      const preventClipboardEvent = (event: ClipboardEvent) => {
        if (!shouldBlockClipboard()) return;
        event.preventDefault();
        showClipboardBlockedToast();
      };

      domNode.addEventListener('copy', preventClipboardEvent);
      domNode.addEventListener('cut', preventClipboardEvent);
      domNode.addEventListener('paste', preventClipboardEvent);

      editorSecurityDisposablesRef.current.push({
        dispose: () => {
          domNode.removeEventListener('copy', preventClipboardEvent);
          domNode.removeEventListener('cut', preventClipboardEvent);
          domNode.removeEventListener('paste', preventClipboardEvent);
        },
      });
    }

    editor.onDidChangeCursorPosition((e: any) => {
      if (!roomId || !user?.id || !user?.name) return;

      refreshLocalPresence({
        cursor: {
          lineNumber: e.position.lineNumber,
          column: e.position.column,
        },
      });
      emitUserActivity();
    });
  };

  useEffect(() => {
    if (roomId && user) {
      const ydoc = new Y.Doc();
      const yText = ydoc.getText(CODE_FIELD);
      const awareness = new Awareness(ydoc);

      ydocRef.current = ydoc;
      yTextRef.current = yText;
      awarenessRef.current = awareness;

      refreshLocalPresence({
        cursor: null,
        typing: false,
      });

      const handleDocUpdate = (update: Uint8Array, origin: unknown) => {
        updateCode(yText.toString());

        if (origin === REMOTE_SYNC_ORIGIN || origin === INITIAL_SYNC_ORIGIN) {
          return;
        }

        socket.emit('yjs-update', { roomId, update });
        emitTypingActivity();
        setLocalTypingPresence();
      };

      const handleYTextObserve = (event: any, transaction: any) => {
        if (transaction?.origin === REMOTE_SYNC_ORIGIN || transaction?.origin === INITIAL_SYNC_ORIGIN) {
          return;
        }

        if (!roomId || !user?.id) return;
        if (isTeacherRef.current || roomModeRef.current !== 'practice') return;

        const delta = Array.isArray(event?.delta) ? event.delta : [];
        if (!delta.length) return;

        const updatedPersonalCode = applyDeltaToPersonalCode(personalSubmissionCodeRef.current, delta);
        personalSubmissionCodeRef.current = updatedPersonalCode;

        socket.emit('practice-submission-update', {
          roomId,
          code: updatedPersonalCode,
          language: languageRef.current,
        });
      };

      const handleAwarenessUpdate = (
        { added, updated, removed }: { added: number[]; updated: number[]; removed: number[] },
        origin: unknown
      ) => {
        syncPresenceFromAwareness();

        if (origin === REMOTE_SYNC_ORIGIN || origin === INITIAL_SYNC_ORIGIN) {
          return;
        }

        const changedClients = [...added, ...updated, ...removed];
        if (!changedClients.length) return;

        socket.emit('yjs-awareness', {
          roomId,
          update: encodeAwarenessUpdate(awareness, changedClients),
          clientId: awareness.clientID,
        });
      };

      ydoc.on('update', handleDocUpdate);
      yText.observe(handleYTextObserve);
      awareness.on('update', handleAwarenessUpdate);

      socket.auth = { token: localStorage.getItem('token') };
      socket.connect();
      setIsConnected(true);
      socket.emit('join-room', { roomId, userId: user.id, userName: user.name, avatarColor: user.avatarColor || '#4F46E5' });
      socket.on('yjs-init', (payload: any) => {
        const documentUpdate = normalizeBinaryUpdate(payload?.documentUpdate);
        if (documentUpdate.length) {
          Y.applyUpdate(ydoc, documentUpdate, INITIAL_SYNC_ORIGIN);
        }

        const awarenessUpdate = normalizeBinaryUpdate(payload?.awarenessUpdate);
        if (awarenessUpdate.length) {
          applyAwarenessUpdate(awareness, awarenessUpdate, INITIAL_SYNC_ORIGIN);
          syncPresenceFromAwareness();
        }

        bindMonacoToYjs();

        // Seed student's personal practice buffer from current doc so delta application
        // doesn't scramble text when the shared doc already contains starter code.
        // (We still ignore remote edits later; this buffer only tracks the student's local changes.)
        if (!isTeacherRef.current && roomModeRef.current === 'practice') {
          personalSubmissionCodeRef.current = yText.toString();
        }
      });
      socket.on('yjs-update', (incomingUpdate: any) => {
        const normalized = normalizeBinaryUpdate(incomingUpdate);
        if (normalized.length) {
          Y.applyUpdate(ydoc, normalized, REMOTE_SYNC_ORIGIN);
        }
      });
      socket.on('yjs-awareness', (incomingUpdate: any) => {
        const normalized = normalizeBinaryUpdate(incomingUpdate);
        if (normalized.length) {
          applyAwarenessUpdate(awareness, normalized, REMOTE_SYNC_ORIGIN);
          syncPresenceFromAwareness();
        }
      });
      socket.on('participants-updated', ({ participants }: any) => {
        setActiveParticipants(participants);

        const participantIds = new Set((participants || []).map((participant: any) => participant.id));
        setCursorPositions((prev) => {
          const next: Record<string, { lineNumber: number; column: number; name: string }> = {};
          Object.entries(prev).forEach(([participantId, value]) => {
            if (participantIds.has(participantId)) {
              next[participantId] = value;
            }
          });
          return next;
        });

        setTypingUsers((prev) => {
          const next: Record<string, { name: string }> = {};
          Object.entries(prev).forEach(([participantId, value]) => {
            if (participantIds.has(participantId)) {
              next[participantId] = value;
            } else if (typingResetTimersRef.current[participantId] !== undefined) {
              window.clearTimeout(typingResetTimersRef.current[participantId]);
              delete typingResetTimersRef.current[participantId];
            }
          });
          return next;
        });
      });
      socket.on('activity-update', (payload: any) => {
        if (payload?.roomId !== roomId) return;

        const nextActivity: Record<string, ActivitySnapshot> = {};
        const users = Array.isArray(payload?.users) ? payload.users : [];

        users.forEach((entry: any) => {
          if (!entry?.userId) return;
          nextActivity[entry.userId] = {
            status: entry.status === 'active' || entry.status === 'idle' || entry.status === 'inactive' ? entry.status : 'inactive',
            lastActive: typeof entry.lastActive === 'number' ? entry.lastActive : Date.now(),
          };
        });

        setActivityMap(nextActivity);
      });
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
        if (state?.mode === 'broadcast' || state?.mode === 'practice') {
          setRoomMode(state.mode);
        }
      });
      socket.on('room-mode-updated', (data: any) => {
        if (data?.mode === 'broadcast' || data?.mode === 'practice') {
          setRoomMode(data.mode);
          toast({
            title: data.mode === 'practice' ? 'Practice enabled for students' : 'Practice disabled by teacher',
            duration: 2000,
          });
        }
      });
      socket.on('room-lock-updated', (data: any) => {
        if (typeof data?.isLocked === 'boolean') {
          setIsEditorLocked(data.isLocked);
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
      socket.on('session-insights-ready', ({ roomId: r }: any) => {
        if (r !== roomId) return;
        toast({
          title: '🎉 Session insights are ready',
          description: 'Click to view the full report',
          duration: 8000,
          action: (
            <button
              onClick={() => navigate(`/rooms/${roomId}/report`)}
              style={{ padding: '6px 14px', borderRadius: '8px', background: 'rgba(99,102,241,0.2)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.35)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              View Report →
            </button>
          ),
        } as any);
      });
      return () => {
        socket.off('yjs-init'); socket.off('yjs-update'); socket.off('yjs-awareness'); socket.off('language-update'); socket.off('participants-updated'); socket.off('activity-update'); socket.off('user-joined'); socket.off('user-left'); socket.off('room-control-state'); socket.off('room-mode-updated'); socket.off('room-lock-updated'); socket.off('room-chat-history'); socket.off('chat-message'); socket.off('participant-removed'); socket.off('removed-from-room'); socket.off('session-insights-ready');
        if (typingStopTimerRef.current !== null) {
          window.clearTimeout(typingStopTimerRef.current);
          typingStopTimerRef.current = null;
        }
        if (awarenessTypingTimerRef.current !== null) {
          window.clearTimeout(awarenessTypingTimerRef.current);
          awarenessTypingTimerRef.current = null;
        }
        Object.values(typingResetTimersRef.current).forEach((timerId) => {
          window.clearTimeout(timerId);
        });
        typingResetTimersRef.current = {};
        ydoc.off('update', handleDocUpdate);
        yText.unobserve(handleYTextObserve);
        awareness.off('update', handleAwarenessUpdate);
        socket.emit('leave-room', { roomId, userId: user.id });
        destroyYjsBinding();
        editorSecurityDisposablesRef.current.forEach((disposable) => disposable.dispose());
        editorSecurityDisposablesRef.current = [];
        socket.disconnect();
        setIsConnected(false);
      };
    }
  }, [roomId, user]);

  useEffect(() => {
    // If teacher enables practice while the student is already in the room,
    // initialize the personal submission buffer at that moment to keep
    // subsequent deltas aligned with the current document text.
    if (isTeacher) return;
    if (roomMode !== 'practice') return;
    if (personalSubmissionCodeRef.current) return;
    const currentText = yTextRef.current?.toString() ?? '';
    personalSubmissionCodeRef.current = currentText;
  }, [roomMode, isTeacher]);

  useEffect(() => {
    roomModeRef.current = roomMode;
  }, [roomMode]);

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  useEffect(() => {
    isTeacherRef.current = isTeacher;
  }, [isTeacher]);

  useEffect(() => {
    personalSubmissionCodeRef.current = '';
  }, [roomId, user?.id]);

  useEffect(() => {
    if (!currentRoom) return;
    if (currentRoom.teacherId) {
      setTeacherId(currentRoom.teacherId);
    }
    if (typeof currentRoom.isLocked === 'boolean') {
      setIsEditorLocked(currentRoom.isLocked);
    }
    if (currentRoom.mode === 'broadcast' || currentRoom.mode === 'practice') {
      setRoomMode(currentRoom.mode);
    }
  }, [currentRoom]);

  useEffect(() => {
    if (!roomId || isJoiningRoom.current) return;

    // Always load data for the active route room to avoid sharing stale code state
    // from a previously opened room.
    if (currentRoom?.id === roomId) return;

    isJoiningRoom.current = true;
    joinRoom(roomId).finally(() => { isJoiningRoom.current = false; });
  }, [roomId, currentRoom?.id]);
  useEffect(() => {
    setActivityMap({});
    setCursorPositions({});
    setTypingUsers({});
    if (typingStopTimerRef.current !== null) {
      window.clearTimeout(typingStopTimerRef.current);
      typingStopTimerRef.current = null;
    }
    if (awarenessTypingTimerRef.current !== null) {
      window.clearTimeout(awarenessTypingTimerRef.current);
      awarenessTypingTimerRef.current = null;
    }
    Object.values(typingResetTimersRef.current).forEach((timerId) => {
      window.clearTimeout(timerId);
    });
    typingResetTimersRef.current = {};
  }, [roomId]);
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ readOnly: isEditorReadOnly });
    }
  }, [isEditorReadOnly]);
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
  const handleSaveCode = async () => {
    try {
      if (!roomId) return;
      const liveCode = editorRef.current ? editorRef.current.getValue() : code;
      await roomService.saveCode({
        roomId,
        code: liveCode,
        language,
        yjsState: ydocRef.current ? encodeYDocState(ydocRef.current) : undefined,
      });
      toast({ title: 'Code saved successfully' });
    } catch {
      toast({ title: 'Failed to save code', variant: 'destructive' });
    }
  };
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
    const nextMode = roomMode === 'practice' ? 'broadcast' : 'practice';
    socket.emit('toggle-mode', { roomId, mode: nextMode });
  };
  const handleRemoveParticipant = () => {
    if (!roomId || !isTeacher || !selectedParticipantId) return;
    socket.emit('remove-participant', { roomId, targetUserId: selectedParticipantId });
    setSelectedParticipantId('');
  };

  const participants = activeParticipants && activeParticipants.length > 0 ? activeParticipants : [{ id: user?.id || '1', name: user?.name || 'You', avatarColor: user?.avatarColor || '#4F46E5', isOnline: true }];
  const participantNameById = participants.reduce<Record<string, string>>((acc, participant) => {
    acc[participant.id] = participant.name;
    return acc;
  }, {});
  const typingIndicators = Object.entries(typingUsers)
    .map(([typingUserId, payload]) => {
      const cursor = cursorPositions[typingUserId];
      return {
        id: typingUserId,
        name: payload.name || participantNameById[typingUserId] || 'Unknown',
        lineNumber: cursor?.lineNumber,
        column: cursor?.column,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
  const classroomParticipants = participants.filter((participant) => participant.id !== teacherId);
  const removableParticipants = participants.filter((p) => p.id !== teacherId);
  const allMessages = messages
    .slice()
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const activityPalette: Record<ActivityStatus, { dot: string; glow: string; label: string; badge: string }> = {
    active: {
      dot: '#34D399',
      glow: 'shadow-[0_0_18px_rgba(52,211,153,0.35)]',
      label: 'Active',
      badge: 'rgba(16,185,129,0.12)',
    },
    idle: {
      dot: '#FBBF24',
      glow: 'shadow-[0_0_14px_rgba(251,191,36,0.22)] animate-pulse',
      label: 'Idle',
      badge: 'rgba(251,191,36,0.12)',
    },
    inactive: {
      dot: '#FB7185',
      glow: 'shadow-[0_0_10px_rgba(251,113,133,0.12)] opacity-80',
      label: 'Inactive',
      badge: 'rgba(251,113,133,0.12)',
    },
  };

  return (
    <div className="h-screen flex flex-col bg-background">

      {/* ── HEADER ── */}
      <header className="h-[52px] shrink-0 flex items-center justify-between px-[14px] bg-card border-b border-border/50">

        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={handleLeave} className="w-[30px] h-[30px] rounded-lg flex items-center justify-center text-muted-foreground bg-transparent border-none cursor-pointer transition-all duration-150 hover:text-foreground hover:bg-muted/60">
            <ChevronLeft size={18} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Code2 size={15} color="white" />
            </div>
            <div>
              <div className="text-[13px] font-semibold leading-none text-foreground">{currentRoom?.name || 'Coding Room'}</div>
              <button onClick={handleCopyRoomId} className="text-muted-foreground/60 hover:text-muted-foreground bg-transparent border-none cursor-pointer flex items-center gap-1 font-mono p-0 mt-0.5 transition-colors duration-150 text-[11px]">
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
            <span className="px-2 py-[3px] rounded-full text-[11px] font-semibold border" style={{ borderColor: isEditorLocked ? 'rgba(239,68,68,0.25)' : 'hsl(var(--border))', background: isEditorLocked ? 'rgba(239,68,68,0.12)' : 'hsl(var(--muted) / 0.5)', color: isEditorLocked ? '#EF4444' : 'hsl(var(--muted-foreground))' }}>
              {isPracticeEnabled ? 'Practice Enabled' : 'Practice Disabled'}
            </span>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Participant avatars */}
          <div className="hidden sm:flex" style={{ alignItems: 'center', marginRight: '4px' }}>
            {participants.slice(0, 5).map((p, i) => (
              <div key={p.id} title={p.name} className="border-2 border-card" style={{ width: '26px', height: '26px', borderRadius: '50%', background: p.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: '#fff', marginLeft: i > 0 ? '-7px' : 0, zIndex: 5 - i, position: 'relative' }}>
                {p.name.charAt(0).toUpperCase()}
                {p.isOnline && <span className="border-[1.5px] border-card" style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '7px', height: '7px', borderRadius: '50%', background: '#10B981' }} />}
              </div>
            ))}
            {participants.length > 5 && <span className="text-[11px] text-muted-foreground ml-[7px]">+{participants.length - 5}</span>}
          </div>

          {/* Language selector */}
          <Select value={language} onValueChange={(v) => { setLanguage(v as 'javascript' | 'python'); socket.emit('language-change', { roomId, language: v, userId: user?.id, userName: user?.name }); }}>
            <SelectTrigger className="w-[130px] h-8 text-[12px] bg-muted/50 border border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border border-border">
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
            </SelectContent>
          </Select>

          {/* Theme Toggle */}
          <div className="flex items-center justify-center">
            <ThemeToggle />
          </div>

          {isTeacher && (
            <>
              <button
                onClick={handleToggleLock}
                className="h-8 px-3 rounded-lg text-[12px] font-semibold flex items-center gap-1.5 bg-muted/50 text-foreground border border-border cursor-pointer transition-all duration-150 hover:bg-muted hover:border-border"
              >
                {isPracticeEnabled ? <Lock size={13} /> : <Unlock size={13} />}
                {isPracticeEnabled ? 'Disable Practice' : 'Enable Practice'}
              </button>
              <select
                value={selectedParticipantId}
                onChange={(e) => setSelectedParticipantId(e.target.value)}
                className="h-8 min-w-[170px] px-2.5 rounded-lg text-[12px] font-medium bg-muted/50 text-foreground border border-border outline-none"
              >
                <option value="" className="bg-card text-muted-foreground">Select participant</option>
                {removableParticipants.map((participant) => (
                  <option key={participant.id} value={participant.id} className="bg-card text-foreground">
                    {participant.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleRemoveParticipant}
                disabled={!selectedParticipantId}
                style={{ height: '32px', padding: '0 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', background: 'rgba(239,68,68,0.12)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)', cursor: selectedParticipantId ? 'pointer' : 'not-allowed', opacity: selectedParticipantId ? 1 : 0.55, transition: 'all 0.15s' }}
              >
                Remove
              </button>
            </>
          )}

          {/* Report (teacher sees full, students see own) */}
          <button
            id="session-report-btn"
            onClick={() => navigate(`/rooms/${roomId}/report`)}
            className="h-8 px-3 rounded-lg text-[12px] font-semibold flex items-center gap-1.5 bg-muted/50 text-muted-foreground border border-border cursor-pointer transition-all duration-150 hover:bg-muted hover:text-foreground"
          >
            <FileBarChart2 size={13} />
            <span className="hidden sm:inline">Report</span>
          </button>

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
            className="h-8 px-3 rounded-lg text-[12px] font-medium flex items-center gap-1.5 bg-muted/50 text-muted-foreground border border-border cursor-pointer transition-all duration-150 hover:bg-muted hover:text-foreground"
          >
            <Save size={13} />
            <span className="hidden sm:inline">Save</span>
          </button>

          {/* Chat toggle */}
          <button onClick={() => setIsChatOpen(!isChatOpen)}
            className={`h-8 w-8 rounded-lg flex items-center justify-center relative border cursor-pointer transition-all duration-150 ${
              isChatOpen
                ? 'bg-primary/15 border-primary/35 text-primary'
                : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <MessageCircle size={15} />
            {allMessages.length > 0 && !isChatOpen && (
              <span style={{ position: 'absolute', top: '-5px', right: '-5px', width: '16px', height: '16px', borderRadius: '50%', background: '#4F46E5', color: '#fff', fontSize: '9px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {allMessages.length > 9 ? '9+' : allMessages.length}
              </span>
            )}
          </button>

          <button className="sm:hidden h-8 w-8 rounded-lg flex items-center justify-center bg-muted/50 border border-border text-muted-foreground cursor-pointer">
            <Users size={15} />
          </button>
        </div>
      </header>

      {typingIndicators.length > 0 && (
        <div className="shrink-0 border-b border-border/50 bg-card px-[14px] py-1.5">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground whitespace-nowrap">Typing Now</span>
            {typingIndicators.map((indicator) => (
              <div
                key={indicator.id}
                className="px-2 py-1 rounded-md border border-primary/25 bg-primary/10 text-primary text-[11px] whitespace-nowrap"
              >
                {indicator.name}{' '}
                {indicator.lineNumber && indicator.column
                  ? `• Ln ${indicator.lineNumber}, Col ${indicator.column}`
                  : '• Cursor moving'}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Editor column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }} className={isTeacher ? 'xl:pr-[352px]' : ''}>
            {isTeacher && (
              <motion.aside
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                style={{
                  margin: '12px',
                  borderRadius: '18px',
                  boxShadow: '0 18px 50px rgba(0,0,0,0.1)',
                  overflow: 'hidden',
                }}
                className="xl:absolute xl:right-4 xl:top-4 xl:z-20 xl:m-0 xl:w-[330px] bg-card/95 border border-border/80 backdrop-blur-md"
              >
                <div style={{ padding: '14px 14px 12px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }} className="border-b border-border/50">
                  <div>
                    <div className="text-[13px] font-bold text-foreground" style={{ letterSpacing: '-0.01em' }}>Live Classroom Intelligence</div>
                    <div className="text-[11px] text-muted-foreground mt-[3px]">Teacher-only engagement signal</div>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#3B82F6', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.18)', padding: '4px 8px', borderRadius: '999px' }}>
                    {classroomParticipants.length} students
                  </span>
                </div>

                <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '340px', overflowY: 'auto' }}>
                  {classroomParticipants.length === 0 ? (
                    <div className="py-5 px-3 text-center text-muted-foreground text-[12px]">
                      Waiting for participants to join.
                    </div>
                  ) : (
                    classroomParticipants.map((participant) => {
                      const snapshot = activityMap[participant.id];
                      const status = snapshot?.status || 'inactive';
                      const state = activityPalette[status];
                      const cursorPos = cursorPositions[participant.id];

                      return (
                        <motion.div
                          key={participant.id}
                          layout
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.18, ease: 'easeOut' }}
                          className="border border-border/60 bg-muted/30"
                          style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 11px', borderRadius: '14px' }}
                        >
                          <div className="border-2 border-card" style={{ position: 'relative', width: '38px', height: '38px', borderRadius: '50%', background: participant.avatarColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>
                            {participant.name.charAt(0).toUpperCase()}
                            <span className={state.glow} style={{ position: 'absolute', right: '-1px', bottom: '-1px', width: '11px', height: '11px', borderRadius: '50%', background: state.dot, border: '2px solid hsl(var(--card))' }} />
                          </div>

                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-[13px] font-semibold text-foreground" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {participant.name}
                              </div>
                              {cursorPos && (
                                <span className="text-[10px] font-mono font-semibold text-primary shrink-0" style={{ background: 'hsl(var(--primary) / 0.1)', padding: '2px 6px', borderRadius: '6px', border: '1px solid hsl(var(--primary) / 0.2)' }}>
                                  Ln {cursorPos.lineNumber}
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginTop: '4px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.02em', color: state.dot, background: state.badge, padding: '3px 8px', borderRadius: '999px' }} className="border border-border/50">
                                {state.label}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {snapshot ? formatLastActive(snapshot.lastActive) : 'No recent activity'}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </motion.aside>
            )}

            <Editor
              height="100%"
              language={language}
              defaultValue={code}
              onMount={handleEditorDidMount}
              theme={isDarkMode ? 'vs-dark' : 'light'}
              options={{ readOnly: isEditorReadOnly, fontSize: 14, fontFamily: 'JetBrains Mono, monospace', fontLigatures: true, minimap: { enabled: false }, padding: { top: 18, bottom: 18 }, scrollBeyondLastLine: false, automaticLayout: true, tabSize: 2, wordWrap: 'on', lineNumbersMinChars: 3, renderLineHighlight: 'gutter', cursorBlinking: 'smooth', smoothScrolling: true }}
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
                style={{ minHeight: '140px', maxHeight: '320px' }}
                className="shrink-0 border-t border-border/80 flex flex-col bg-background"
              >
                {/* Panel header */}
                <div className="flex items-center justify-between py-2 px-3.5 border-b border-border/50 shrink-0 bg-card">
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
                        className="h-[22px] px-2 rounded-[5px] flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-transparent border border-border cursor-pointer transition-all duration-150 hover:text-foreground hover:border-border"
                      >
                        {outputCopied ? <Check size={10} color="#34D399" /> : <Copy size={10} />}
                        {outputCopied ? 'Copied' : 'Copy'}
                      </button>
                    )}
                    <button onClick={() => setIsOutputOpen(false)}
                      className="w-[22px] h-[22px] rounded-[5px] flex items-center justify-center text-muted-foreground bg-transparent border-none cursor-pointer transition-all duration-150 hover:text-foreground hover:bg-muted/50"
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
                            <span className="text-muted-foreground">[{entry.timestamp}]</span>
                            <span style={{ color: metaColor, fontWeight: 700 }}>{label}</span>
                            <span className={entry.level === 'stderr' || entry.level === 'error' ? 'text-red-300' : 'text-foreground'} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{entry.message}</span>
                          </div>
                        );
                      })}
                      <div ref={outputEndRef} />
                    </div>
                  ) : (
                    /* Initial idle state */
                    <div className="flex items-center gap-2 text-muted-foreground font-mono text-[12px]">
                      <span style={{ color: '#34D399' }}>$</span>
                      <span>Press <strong className="text-foreground/60">Run</strong> to execute your code…</span>
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
              className="shrink-0 flex flex-col border-l border-border/80 overflow-hidden bg-card"
            >
              {/* Chat header */}
              <div className="py-3 px-4 border-b border-border/50 flex items-center justify-between shrink-0">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageCircle size={15} className="text-primary" />
                  <span className="font-semibold text-foreground text-[13px]">Team Chat</span>
                  {allMessages.length > 0 && (
                    <span className="text-[10px] px-[7px] py-[2px] rounded-full bg-primary/15 text-primary font-semibold">{allMessages.length}</span>
                  )}
                </div>
                <button onClick={() => setIsChatOpen(false)} className="w-[26px] h-[26px] rounded-[7px] flex items-center justify-center text-muted-foreground bg-transparent border-none cursor-pointer transition-all duration-150 hover:text-foreground hover:bg-muted/50">
                  <X size={14} />
                </button>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {allMessages.length === 0 ? (
                  <div style={{ textAlign: 'center', paddingTop: '48px' }}>
                    <MessageCircle size={32} className="text-muted-foreground/20 mx-auto mb-2.5" />
                    <p className="text-[13px] text-muted-foreground">No messages yet</p>
                    <p className="text-[12px] text-muted-foreground/70 mt-1">Start the conversation!</p>
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
                          {!isOwn && <span className="text-[10px] font-semibold text-muted-foreground">{msg.userName}</span>}
                          <span className="text-[10px] text-muted-foreground/70">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className={isOwn ? 'bg-primary/15 border border-primary/25 text-foreground' : 'bg-muted/50 border border-border text-foreground'}
                          style={{ padding: '8px 12px', borderRadius: isOwn ? '14px 14px 4px 14px' : '14px 14px 14px 4px', fontSize: '13px', lineHeight: 1.5 }}>
                          {msg.content}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="p-2.5 border-t border-border shrink-0">
                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} style={{ display: 'flex', gap: '8px' }}>
                  <input placeholder="Type a message…" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 py-[9px] px-3 rounded-[10px] text-[13px] text-foreground bg-muted/50 border border-border outline-none transition-all duration-150 font-sans placeholder:text-muted-foreground/40 focus:border-primary/50 focus:bg-muted"
                  />
                  <button type="submit" disabled={!newMessage.trim()}
                    style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: newMessage.trim() ? '#4F46E5' : 'hsl(var(--muted))', border: 'none', cursor: newMessage.trim() ? 'pointer' : 'not-allowed', opacity: newMessage.trim() ? 1 : 0.4, transition: 'all 0.15s', flexShrink: 0 }}
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
