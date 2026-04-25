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
  const [speed, setSpeed] = useState<1 | 2>(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState<string>('all');

  const playTimerRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);

  // Derived list of events to replay (filtered by user if student, or by selection if teacher)
  const events: SessionEvent[] = (() => {
    if (!recording) return [];
    if (!isTeacher) return recording.events; // already server-filtered to own events
    if (selectedUserId === 'all') return recording.events;
    return recording.events.filter((e) => e.userId === selectedUserId);
  })();

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

  // ─── PLAYBACK TICK ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying || events.length === 0) return;

    const tick = () => {
      const now = performance.now();
      const elapsed = (now - lastTickRef.current) * speed;
      lastTickRef.current = now;

      setCurrentIndex((prev) => {
        if (prev >= events.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        // Find next event whose offset fits in elapsed real-time
        const baseTs = events[0].timestamp;
        const currentTs = events[prev].timestamp;
        const nextTs = currentTs + elapsed;

        let next = prev + 1;
        while (next < events.length - 1 && events[next].timestamp < nextTs) {
          next++;
        }
        if (events[next]) {
          onEditorUpdate(events[next].code);
        }
        return next;
      });

      playTimerRef.current = window.requestAnimationFrame(tick);
    };

    lastTickRef.current = performance.now();
    playTimerRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (playTimerRef.current !== null) cancelAnimationFrame(playTimerRef.current);
    };
  }, [isPlaying, speed, events, onEditorUpdate]);

  const handlePlayPause = () => {
    if (currentIndex >= events.length - 1) {
      seekTo(0);
    }
    setIsPlaying((p) => !p);
  };

  const handleRestart = () => {
    setIsPlaying(false);
    seekTo(0);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPlaying(false);
    seekTo(Number(e.target.value));
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
        background: 'linear-gradient(180deg, rgba(10,14,26,0.97) 0%, rgba(7,10,20,0.99) 100%)',
        borderTop: '1px solid rgba(99,102,241,0.3)',
        backdropFilter: 'blur(20px)',
        padding: '16px 20px 20px',
        boxShadow: '0 -8px 40px rgba(99,102,241,0.12)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={14} color="#818CF8" />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0' }}>Session Replay</div>
            <div style={{ fontSize: '11px', color: 'rgba(148,163,184,0.7)', marginTop: '1px' }}>
              {isTeacher ? 'Reviewing full session' : 'Your coding session'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Speed toggle */}
          <button
            onClick={() => setSpeed(speed === 1 ? 2 : 1)}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
              background: speed === 2 ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
              color: speed === 2 ? '#818CF8' : 'rgba(148,163,184,0.8)',
              border: `1px solid ${speed === 2 ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`,
              cursor: 'pointer', transition: 'all 0.15s',
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
              style={{
                height: '28px', padding: '0 8px', borderRadius: '6px', fontSize: '11px',
                background: 'rgba(255,255,255,0.05)', color: '#e2e8f0',
                border: '1px solid rgba(255,255,255,0.09)', outline: 'none',
              }}
            >
              <option value="all">All Users</option>
              {uniqueUserIds.map((id) => (
                <option key={id} value={id} style={{ background: '#0D1117' }}>
                  {id.slice(-6)}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={onClose}
            style={{ width: '28px', height: '28px', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: 'rgba(148,163,184,0.6)', cursor: 'pointer', transition: 'color 0.15s' }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '20px 0', color: 'rgba(148,163,184,0.6)', fontSize: '13px' }}>
          <div style={{ width: '20px', height: '20px', border: '2px solid rgba(99,102,241,0.3)', borderTopColor: '#818CF8', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 10px' }} />
          Loading recording…
        </div>
      ) : error ? (
        <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5', fontSize: '12px', textAlign: 'center' }}>
          {error}
        </div>
      ) : events.length === 0 ? (
        <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(148,163,184,0.6)', fontSize: '12px', textAlign: 'center' }}>
          No coding activity recorded in this session.
        </div>
      ) : (
        <>
          {/* Timeline slider */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'rgba(100,116,139,0.8)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '6px' }}>
              <span>{formatDuration(currentOffsetMs)}</span>
              <span style={{ color: 'rgba(99,102,241,0.7)' }}>{currentIndex + 1} / {events.length}</span>
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
                  accentColor: '#818CF8',
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
              style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(148,163,184,0.7)', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }}
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
            <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
              <motion.div
                style={{ height: '100%', background: 'linear-gradient(90deg, #4F46E5, #818CF8)', borderRadius: '99px' }}
                animate={{ width: events.length > 1 ? `${(currentIndex / (events.length - 1)) * 100}%` : '0%' }}
                transition={{ duration: 0.05 }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'rgba(100,116,139,0.7)', fontFamily: 'JetBrains Mono, monospace', flexShrink: 0 }}>
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
