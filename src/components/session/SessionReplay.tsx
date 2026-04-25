import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, X, Clock, SkipBack, Zap, ChevronRight } from 'lucide-react';
import sessionService, { SessionEvent, RecordingResponse } from '../../lib/sessionService';

interface SessionReplayProps {
  roomId: string;
  userId: string;
  isTeacher: boolean;
  onClose: () => void;
  onEditorUpdate: (code: string) => void;
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
  const s = (totalSec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function SessionReplay({
  roomId,
  userId,
  isTeacher,
  onClose,
  onEditorUpdate,
}: SessionReplayProps) {
  const [recording, setRecording] = useState<RecordingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<1 | 2 | 4>(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState<string>('all');

  const playTimerRef = useRef<number | null>(null);

  // Derived list of events to replay (filtered by user if student, or by selection if teacher)
  const events: SessionEvent[] = (() => {
    if (!recording) return [];
    if (!isTeacher) return recording.events; // already server-filtered to own events
    if (selectedUserId === 'all') return recording.events;
    return recording.events.filter((e) => e.userId === selectedUserId);
  })();

  // Build a map of userId -> userName from events
  const userNameMap: Record<string, string> = {};
  if (recording) {
    for (const evt of recording.events) {
      if (evt.userId && (evt as any).userName) {
        userNameMap[evt.userId] = (evt as any).userName;
      }
    }
  }

  // Unique user IDs for teacher filter dropdown
  const uniqueUserIds = recording
    ? Array.from(new Set(recording.events.map((e) => e.userId)))
    : [];

  const totalDurationMs =
    events.length >= 2 ? events[events.length - 1].timestamp - events[0].timestamp : 0;
  const currentOffsetMs =
    events.length > 0 && currentIndex > 0
      ? events[Math.min(currentIndex, events.length - 1)].timestamp - events[0].timestamp
      : 0;

  // ─── LOAD ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    sessionService
      .getRecording(roomId)
      .then((data) => {
        setRecording(data);
        setCurrentIndex(0);
        if (data.events.length > 0) {
          onEditorUpdate(data.events[0].code);
        }
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Failed to load recording');
      })
      .finally(() => setIsLoading(false));
  }, [roomId]);

  // ─── SEEK TO INDEX ────────────────────────────────────────────────────────
  const seekTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, events.length - 1));
      setCurrentIndex(clamped);
      if (events[clamped]) {
        onEditorUpdate(events[clamped].code);
      }
    },
    [events, onEditorUpdate]
  );

  // ─── PLAYBACK TICK (setTimeout-based, gap-aware) ──────────────────────────
  useEffect(() => {
    if (!isPlaying || events.length === 0) return;

    const scheduleNext = (idx: number) => {
      if (idx >= events.length - 1) {
        setIsPlaying(false);
        return;
      }

      // Calculate the real gap between current event and next event
      const gapMs = events[idx + 1].timestamp - events[idx].timestamp;
      // Scale by speed, but cap minimum delay at 16ms to stay responsive
      const delayMs = Math.max(16, gapMs / speed);
      // Cap max delay at 2 seconds to avoid long stalls on idle gaps
      const cappedDelay = Math.min(delayMs, 2000);

      playTimerRef.current = window.setTimeout(() => {
        const nextIdx = idx + 1;
        setCurrentIndex(nextIdx);
        if (events[nextIdx]) {
          onEditorUpdate(events[nextIdx].code);
        }
        scheduleNext(nextIdx);
      }, cappedDelay);
    };

    scheduleNext(currentIndex);

    return () => {
      if (playTimerRef.current !== null) {
        clearTimeout(playTimerRef.current);
        playTimerRef.current = null;
      }
    };
  }, [isPlaying, speed, events, onEditorUpdate, currentIndex]);

  const handlePlayPause = () => {
    if (isPlaying) {
      // Pause: clear any pending timer
      if (playTimerRef.current !== null) {
        clearTimeout(playTimerRef.current);
        playTimerRef.current = null;
      }
      setIsPlaying(false);
    } else {
      // Play: restart from beginning if at end
      if (currentIndex >= events.length - 1) {
        seekTo(0);
        // Small delay to allow state to flush before starting playback
        setTimeout(() => setIsPlaying(true), 50);
      } else {
        setIsPlaying(true);
      }
    }
  };

  const handleRestart = () => {
    if (playTimerRef.current !== null) {
      clearTimeout(playTimerRef.current);
      playTimerRef.current = null;
    }
    setIsPlaying(false);
    seekTo(0);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (playTimerRef.current !== null) {
      clearTimeout(playTimerRef.current);
      playTimerRef.current = null;
    }
    setIsPlaying(false);
    seekTo(Number(e.target.value));
  };

  const handleSpeedToggle = () => {
    // Cycle through 1x → 2x → 4x
    setSpeed((prev) => (prev === 1 ? 2 : prev === 2 ? 4 : 1));
  };

  // ─── UI ───────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        backdropFilter: 'blur(20px)',
        padding: '16px 20px 20px',
      }}
      className="bg-card/95 border-t border-border shadow-[0_-8px_40px_rgba(0,0,0,0.15)]"
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
            <Clock size={14} className="text-primary" />
          </div>
          <div>
            <div className="text-[13px] font-bold text-foreground">Session Replay</div>
            <div className="text-[11px] text-muted-foreground mt-px">
              {isTeacher ? 'Reviewing full session' : 'Your coding session'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Speed toggle */}
          <button
            onClick={handleSpeedToggle}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border cursor-pointer transition-all duration-150"
            style={{
              background: speed > 1 ? 'hsl(var(--primary) / 0.15)' : 'hsl(var(--muted) / 0.5)',
              color: speed > 1 ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
              borderColor: speed > 1 ? 'hsl(var(--primary) / 0.35)' : 'hsl(var(--border))',
            }}
          >
            <Zap size={11} />
            {speed}×
          </button>

          {/* Teacher user filter */}
          {isTeacher && uniqueUserIds.length > 1 && (
            <select
              value={selectedUserId}
              onChange={(e) => { setSelectedUserId(e.target.value); setIsPlaying(false); seekTo(0); }}
              className="h-7 px-2 rounded-md text-[11px] bg-muted/50 text-foreground border border-border outline-none"
            >
              <option value="all">All Users</option>
              {uniqueUserIds.map((id) => (
                <option key={id} value={id}>
                  {userNameMap[id] || id.slice(-6)}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center bg-transparent border-none text-muted-foreground cursor-pointer transition-colors duration-150 hover:text-foreground"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-5 text-muted-foreground text-[13px]">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2.5" />
          Loading recording…
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-[12px] text-center">
          {error}
        </div>
      ) : events.length === 0 ? (
        <div className="p-4 rounded-xl bg-muted/30 border border-border text-muted-foreground text-[12px] text-center">
          No coding activity recorded in this session.
        </div>
      ) : (
        <>
          {/* Timeline slider */}
          <div style={{ marginBottom: '14px' }}>
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono mb-1.5">
              <span>{formatDuration(currentOffsetMs)}</span>
              <span className="text-primary/70">{currentIndex + 1} / {events.length}</span>
              <span>{formatDuration(totalDurationMs)}</span>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="replay-timeline-slider"
                type="range"
                min={0}
                max={Math.max(events.length - 1, 0)}
                value={currentIndex}
                onChange={handleSliderChange}
                style={{
                  width: '100%',
                  height: '4px',
                  accentColor: 'hsl(var(--primary))',
                  cursor: 'pointer',
                  borderRadius: '99px',
                }}
              />
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleRestart}
              title="Restart"
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted/50 border border-border text-muted-foreground cursor-pointer transition-all duration-150 hover:text-foreground hover:bg-muted shrink-0"
            >
              <SkipBack size={14} />
            </button>

            <button
              id="replay-play-pause-btn"
              onClick={handlePlayPause}
              style={{
                height: '32px', padding: '0 18px', borderRadius: '8px',
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                color: '#fff', border: 'none', fontSize: '12px', fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
                boxShadow: '0 4px 14px rgba(79,70,229,0.35)',
              }}
            >
              {isPlaying ? <Pause size={13} fill="white" /> : <Play size={13} fill="white" />}
              {isPlaying ? 'Pause' : currentIndex >= events.length - 1 ? 'Replay' : 'Play'}
            </button>

            {/* Progress bar */}
            <div className="flex-1 h-1 bg-muted/50 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))' }}
                animate={{ width: events.length > 1 ? `${(currentIndex / (events.length - 1)) * 100}%` : '0%' }}
                transition={{ duration: 0.05 }}
              />
            </div>

            <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono shrink-0">
              <ChevronRight size={11} />
              <span>{Math.round(events.length > 1 ? (currentIndex / (events.length - 1)) * 100 : 0)}%</span>
            </div>
          </div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
}
