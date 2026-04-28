import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/auth.context';
import { ChevronLeft, Users, Clock, Zap, Award, TrendingUp, BarChart2, AlertCircle, Loader2, User } from 'lucide-react';
import sessionService, { type PracticeSubmission, type ReportResponse, type UserStat } from '../lib/sessionService';

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
      <div className="min-h-screen bg-background flex items-center justify-center flex-col gap-4">
        <div className="spinner-lg" />
        <div className="text-sm text-muted-foreground">Loading session insights…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center flex-col gap-4 p-5">
        <div className="w-[52px] h-[52px] rounded-2xl bg-destructive/10 flex items-center justify-center">
          <AlertCircle size={26} className="text-destructive" />
        </div>
        <div className="text-center">
          <div className="text-base font-bold text-foreground mb-1.5">No Insights Yet</div>
          <div className="text-[13px] text-muted-foreground max-w-[320px]">{error}</div>
        </div>
        <button onClick={() => navigate(-1)} className="px-5 py-2.5 rounded-xl bg-primary/15 text-primary border border-primary/30 text-[13px] cursor-pointer font-semibold hover:bg-primary/20 transition-colors">
          Go Back
        </button>
      </div>
    );
  }

  const { analytics, sessionDurationMs, startedAt, roomName, isTeacher } = report!;
  const submissions = report?.practiceSubmissions || [];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* ── HEADER ── */}
      <header className="border-b border-border/50 bg-card/90 backdrop-blur-xl sticky top-0 z-10">
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted/50 border border-border/50 text-muted-foreground cursor-pointer transition-all duration-150 hover:text-foreground hover:bg-muted"
            >
              <ChevronLeft size={16} />
            </button>
            <div>
              <div className="text-[15px] font-bold text-foreground leading-tight">{roomName}</div>
              <div className="text-[11px] text-muted-foreground">Session Insights</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="text-[11px] text-muted-foreground">
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
                className="bg-card/70 border border-border rounded-2xl p-5 backdrop-blur-xl"
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: card.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {card.icon}
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-foreground mb-1" style={{ letterSpacing: '-0.02em' }}>
                  {card.value}
                </div>
                <div className="text-[13px] font-semibold text-muted-foreground mb-0.5">{card.label}</div>
                <div className="text-[11px] text-muted-foreground/70">{card.sub}</div>
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
            className="bg-card/70 border border-border rounded-2xl overflow-hidden"
          >
            <div className="px-[22px] py-[18px] border-b border-border/60 flex items-center gap-2.5">
              <TrendingUp size={16} className="text-primary" />
              <span className="text-[14px] font-bold text-foreground">
                {isTeacher ? 'Student Insights' : 'Your Activity'}
              </span>
              {isTeacher && (
                <span className="ml-auto text-[11px] font-semibold text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full">
                  {analytics.userStats.length} students
                </span>
              )}
            </div>

            <div className="py-3">
              {analytics.userStats.length === 0 ? (
                <div className="py-8 px-[22px] text-center text-muted-foreground text-[13px]">
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
                      className="flex items-center gap-3.5 px-[22px] py-3 border-b border-border/40 last:border-b-0 hover:bg-muted/30 transition-colors"
                    >
                      {/* Avatar */}
                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: `hsl(${(stat.userId.charCodeAt(0) * 57) % 360}, 55%, 45%)`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, flexShrink: 0 }}>
                        {stat.userName.charAt(0).toUpperCase()}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '7px' }}>
                          <div className="text-[13px] font-semibold text-foreground" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {stat.userName}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '10px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 700, color: engagement.color, background: engagement.bg, border: `1px solid ${engagement.color}30`, padding: '2px 8px', borderRadius: '99px' }}>
                              {engagement.label}
                            </span>
                            <span className="text-[11px] text-muted-foreground font-mono">
                              {stat.activityCount} snapshots
                            </span>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="h-[5px] bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPct}%` }}
                            transition={{ delay: 0.4 + i * 0.06, duration: 0.5, ease: 'easeOut' }}
                            style={{ height: '100%', background: `linear-gradient(90deg, ${engagement.color}aa, ${engagement.color})`, borderRadius: '99px' }}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '14px', marginTop: '6px' }}>
                          <span className="text-[10px] text-muted-foreground">
                            Active: <span style={{ color: '#34D399' }}>{formatDuration(stat.activeTimeMs)}</span>
                          </span>
                          <span className="text-[10px] text-muted-foreground">
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
              className="bg-card/70 border border-border rounded-2xl overflow-hidden"
            >
              <div className="px-[22px] py-[18px] border-b border-border/60 flex items-center gap-2.5">
                <BarChart2 size={16} color="#FBBF24" />
                <span className="text-[14px] font-bold text-foreground">Engagement Distribution</span>
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
                          <span className="text-[12px] text-muted-foreground" style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {stat.userName}
                          </span>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: eng.color }}>{pct}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
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
              <div className="px-[22px] py-3.5 border-t border-border/60 flex gap-4 flex-wrap">
                {[
                  { label: 'Active', color: '#34D399' },
                  { label: 'Moderate', color: '#FBBF24' },
                  { label: 'Low', color: '#FB7185' },
                ].map((l) => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: l.color }} />
                    <span className="text-[11px] text-muted-foreground">{l.label}</span>
                  </div>
                ))}
              </div>
            </motion.section>
          )}
        </div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.35 }}
          className="bg-card/70 border border-border rounded-2xl overflow-hidden mt-5"
        >
          <div className="px-[22px] py-[18px] border-b border-border/60 flex items-center gap-2.5">
            <User size={16} className="text-primary" />
            <span className="text-[14px] font-bold text-foreground">
              {isTeacher ? 'Practice Submissions' : 'Your Practice Submission'}
            </span>
            <span className="ml-auto text-[11px] font-semibold text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full">
              {submissions.length}
            </span>
          </div>

          <div className="p-4 space-y-3">
            {submissions.length === 0 ? (
              <div className="text-[13px] text-muted-foreground">No practice submissions recorded yet.</div>
            ) : (
              submissions.map((submission: PracticeSubmission) => (
                <div
                  key={submission.studentId}
                  className="border border-border/60 rounded-xl bg-muted/25 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between gap-3">
                    <div className="text-[13px] font-semibold text-foreground">{submission.studentName}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {submission.language.toUpperCase()} • {new Date(submission.updatedAt).toLocaleString()}
                    </div>
                  </div>
                  <pre className="m-0 p-4 text-[12px] leading-5 font-mono text-foreground whitespace-pre-wrap break-words bg-background/60">
                    {submission.code || '// No code submitted'}
                  </pre>
                </div>
              ))
            )}
          </div>
        </motion.section>
      </main>

      <style>{`
        .hover-row:hover { background: hsl(var(--muted) / 0.3); }
      `}</style>
    </div>
  );
}
