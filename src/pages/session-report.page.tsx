import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/auth.context';
import { ChevronLeft, Users, Clock, Zap, Award, TrendingUp, BarChart2, AlertCircle, Loader2, User } from 'lucide-react';
import sessionService, { ReportResponse, UserStat } from '../lib/sessionService';

function formatDuration(ms: number): string {
  if (!ms || ms <= 0) return '0m 0s';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}

function getEngagementLevel(count: number, max: number): { label: string; color: string; bg: string } {
  const pct = max > 0 ? count / max : 0;
  if (pct >= 0.66) return { label: 'Active', color: '#34D399', bg: 'rgba(16,185,129,0.1)' };
  if (pct >= 0.33) return { label: 'Moderate', color: '#FBBF24', bg: 'rgba(251,191,36,0.1)' };
  return { label: 'Low', color: '#FB7185', bg: 'rgba(251,113,133,0.1)' };
}

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.35, ease: 'easeOut' } }),
};

export default function SessionReportPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [report, setReport] = useState<ReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) return;
    sessionService
      .getReport(roomId)
      .then(setReport)
      .catch((err) => {
        setError(err?.response?.data?.message || 'Failed to load report');
      })
      .finally(() => setIsLoading(false));
  }, [roomId]);

  const maxActivity = report
    ? Math.max(...(report.analytics?.userStats ?? []).map((s) => s.activityCount), 1)
    : 1;

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#080C14', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: '#818CF8', animation: 'spin 0.9s linear infinite' }} />
        <div style={{ fontSize: '14px', color: 'rgba(148,163,184,0.6)' }}>Loading session insights…</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#080C14', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', padding: '20px' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AlertCircle size={26} color="#F87171" />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>No Insights Yet</div>
          <div style={{ fontSize: '13px', color: 'rgba(148,163,184,0.6)', maxWidth: '320px' }}>{error}</div>
        </div>
        <button onClick={() => navigate(-1)} style={{ padding: '10px 20px', borderRadius: '10px', background: 'rgba(99,102,241,0.15)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.3)', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>
          Go Back
        </button>
      </div>
    );
  }

  const { analytics, sessionDurationMs, startedAt, roomName, isTeacher } = report!;

  return (
    <div style={{ minHeight: '100vh', background: '#080C14', color: '#f1f5f9', fontFamily: 'Inter, sans-serif' }}>
      {/* ── HEADER ── */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(13,17,23,0.9)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => navigate(-1)}
              style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(148,163,184,0.7)', cursor: 'pointer', transition: 'all 0.15s' }}
            >
              <ChevronLeft size={16} />
            </button>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', lineHeight: 1.2 }}>{roomName}</div>
              <div style={{ fontSize: '11px', color: 'rgba(148,163,184,0.6)' }}>Session Insights</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: 'rgba(148,163,184,0.5)' }}>
              {startedAt ? new Date(startedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
            </span>
            <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '99px', background: isTeacher ? 'rgba(99,102,241,0.12)' : 'rgba(16,185,129,0.1)', color: isTeacher ? '#818CF8' : '#34D399', border: `1px solid ${isTeacher ? 'rgba(99,102,241,0.25)' : 'rgba(16,185,129,0.2)'}` }}>
              {isTeacher ? 'Teacher View' : 'Student View'}
            </span>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px 60px' }}>

        {/* ── SUMMARY CARDS ── */}
        {isTeacher && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '36px' }}>
            {[
              {
                icon: <Users size={20} color="#818CF8" />,
                iconBg: 'rgba(99,102,241,0.12)',
                label: 'Total Students',
                value: analytics.totalUsers,
                sub: 'participated in session',
              },
              {
                icon: <Clock size={20} color="#34D399" />,
                iconBg: 'rgba(16,185,129,0.1)',
                label: 'Session Duration',
                value: formatDuration(sessionDurationMs),
                sub: 'total coding time',
              },
              {
                icon: <Zap size={20} color="#FBBF24" />,
                iconBg: 'rgba(251,191,36,0.1)',
                label: 'Avg Engagement',
                value: `${analytics.avgEngagement ?? 0}%`,
                sub: 'class-wide score',
              },
              {
                icon: <Award size={20} color="#F472B6" />,
                iconBg: 'rgba(244,114,182,0.1)',
                label: 'Most Active',
                value: analytics.mostActiveUser || '—',
                sub: 'top contributor',
              },
            ].map((card, i) => (
              <motion.div
                key={card.label}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '16px',
                  padding: '20px',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: card.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {card.icon}
                  </div>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                  {card.value}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(148,163,184,0.9)', marginBottom: '2px' }}>{card.label}</div>
                <div style={{ fontSize: '11px', color: 'rgba(100,116,139,0.7)' }}>{card.sub}</div>
              </motion.div>
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: isTeacher ? '1fr 340px' : '1fr', gap: '20px', alignItems: 'start' }}>

          {/* ── STUDENT INSIGHTS TABLE ── */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.35 }}
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px', overflow: 'hidden' }}
          >
            <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TrendingUp size={16} color="#818CF8" />
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0' }}>
                {isTeacher ? 'Student Insights' : 'Your Activity'}
              </span>
              {isTeacher && (
                <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 600, color: 'rgba(99,102,241,0.8)', background: 'rgba(99,102,241,0.1)', padding: '2px 8px', borderRadius: '99px' }}>
                  {analytics.userStats.length} students
                </span>
              )}
            </div>

            <div style={{ padding: '12px 0' }}>
              {analytics.userStats.length === 0 ? (
                <div style={{ padding: '32px 22px', textAlign: 'center', color: 'rgba(100,116,139,0.7)', fontSize: '13px' }}>
                  No activity data recorded.
                </div>
              ) : (
                analytics.userStats.map((stat: UserStat, i: number) => {
                  const engagement = getEngagementLevel(stat.activityCount, maxActivity);
                  const progressPct = maxActivity > 0 ? (stat.activityCount / maxActivity) * 100 : 0;

                  return (
                    <motion.div
                      key={stat.userId}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + i * 0.06, duration: 0.3 }}
                      style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 22px', borderBottom: i < analytics.userStats.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', transition: 'background 0.15s' }}
                      className="hover-row"
                    >
                      {/* Avatar */}
                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: `hsl(${(stat.userId.charCodeAt(0) * 57) % 360}, 55%, 45%)`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, flexShrink: 0 }}>
                        {stat.userName.charAt(0).toUpperCase()}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '7px' }}>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {stat.userName}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '10px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 700, color: engagement.color, background: engagement.bg, border: `1px solid ${engagement.color}30`, padding: '2px 8px', borderRadius: '99px' }}>
                              {engagement.label}
                            </span>
                            <span style={{ fontSize: '11px', color: 'rgba(100,116,139,0.8)', fontFamily: 'JetBrains Mono, monospace' }}>
                              {stat.activityCount} snapshots
                            </span>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPct}%` }}
                            transition={{ delay: 0.4 + i * 0.06, duration: 0.5, ease: 'easeOut' }}
                            style={{ height: '100%', background: `linear-gradient(90deg, ${engagement.color}aa, ${engagement.color})`, borderRadius: '99px' }}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '14px', marginTop: '6px' }}>
                          <span style={{ fontSize: '10px', color: 'rgba(100,116,139,0.7)' }}>
                            Active: <span style={{ color: '#34D399' }}>{formatDuration(stat.activeTimeMs)}</span>
                          </span>
                          <span style={{ fontSize: '10px', color: 'rgba(100,116,139,0.7)' }}>
                            Idle: <span style={{ color: '#FBBF24' }}>{formatDuration(stat.idleTimeMs)}</span>
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.section>

          {/* ── ENGAGEMENT CHART (teacher only) ── */}
          {isTeacher && analytics.userStats.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.35 }}
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px', overflow: 'hidden' }}
            >
              <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BarChart2 size={16} color="#FBBF24" />
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0' }}>Engagement Distribution</span>
              </div>

              <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[...analytics.userStats]
                  .sort((a, b) => b.activityCount - a.activityCount)
                  .map((stat, i) => {
                    const pct = maxActivity > 0 ? Math.round((stat.activityCount / maxActivity) * 100) : 0;
                    const eng = getEngagementLevel(stat.activityCount, maxActivity);

                    return (
                      <div key={stat.userId}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <span style={{ fontSize: '12px', color: 'rgba(148,163,184,0.85)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {stat.userName}
                          </span>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: eng.color }}>{pct}%</span>
                        </div>
                        <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ delay: 0.5 + i * 0.07, duration: 0.55, ease: 'easeOut' }}
                            style={{ height: '100%', background: `linear-gradient(90deg, ${eng.color}80, ${eng.color})`, borderRadius: '99px' }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Legend */}
              <div style={{ padding: '14px 22px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {[
                  { label: 'Active', color: '#34D399' },
                  { label: 'Moderate', color: '#FBBF24' },
                  { label: 'Low', color: '#FB7185' },
                ].map((l) => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: l.color }} />
                    <span style={{ fontSize: '11px', color: 'rgba(100,116,139,0.8)' }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        .hover-row:hover { background: rgba(255,255,255,0.025); }
      `}</style>
    </div>
  );
}
