import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

/* ============================================================
   DESIGN SYSTEM COMPONENTS — Enterprise SaaS (Stripe / Linear)
============================================================ */

/* ── Badge ── */
export const Badge = ({
  children,
  variant = 'default',
  icon: Icon,
}: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'blue';
  icon?: LucideIcon;
}) => {
  const styles: Record<string, React.CSSProperties> = {
    default: {
      background: 'rgba(99,102,241,0.1)',
      border: '1px solid rgba(99,102,241,0.22)',
      color: '#a5b4fc',
    },
    success: {
      background: 'rgba(16,185,129,0.1)',
      border: '1px solid rgba(16,185,129,0.22)',
      color: '#6ee7b7',
    },
    warning: {
      background: 'rgba(245,158,11,0.1)',
      border: '1px solid rgba(245,158,11,0.22)',
      color: '#fcd34d',
    },
    error: {
      background: 'rgba(239,68,68,0.1)',
      border: '1px solid rgba(239,68,68,0.22)',
      color: '#fca5a5',
    },
    blue: {
      background: 'rgba(37,99,235,0.1)',
      border: '1px solid rgba(37,99,235,0.22)',
      color: '#93c5fd',
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 12px',
        borderRadius: '999px',
        fontSize: '12px',
        fontWeight: 500,
        letterSpacing: '0.01em',
        ...styles[variant],
      }}
    >
      {Icon && <Icon size={13} />}
      {children}
    </motion.div>
  );
};

/* ── Section Heading ── */
export const SectionHeading = ({
  title,
  subtitle,
  align = 'left',
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  eyebrow?: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={align === 'center' ? 'text-center' : ''}
    >
      {eyebrow && (
        <p
          style={{
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#818cf8',
            marginBottom: '12px',
          }}
        >
          {eyebrow}
        </p>
      )}
      <h2
        style={{
          fontSize: 'clamp(1.875rem, 4vw, 2.75rem)',
          fontWeight: 800,
          color: '#f1f5f9',
          lineHeight: 1.15,
          letterSpacing: '-0.02em',
          marginBottom: '12px',
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            fontSize: '1.0625rem',
            color: '#6B7280',
            maxWidth: '540px',
            lineHeight: 1.65,
            ...(align === 'center' ? { margin: '0 auto' } : {}),
          }}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};

/* ── Feature Card ── */
export const FeatureCard = ({
  icon: Icon,
  title,
  description,
  index = 0,
  accent = 'indigo',
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  index?: number;
  accent?: 'indigo' | 'blue';
}) => {
  const accentMap = {
    indigo: { bg: 'rgba(99,102,241,0.12)', color: '#818CF8', border: 'rgba(99,102,241,0.2)' },
    blue:   { bg: 'rgba(37,99,235,0.12)',  color: '#60A5FA', border: 'rgba(37,99,235,0.2)'  },
  };
  const a = accentMap[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      style={{
        padding: '24px',
        borderRadius: '16px',
        background: '#111827',
        border: '1px solid rgba(255,255,255,0.07)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      className="group hover:border-indigo-500/25 hover:shadow-[0_8px_28px_rgba(0,0,0,0.4)]"
    >
      {/* Subtle top-left gradient on hover */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '120px', height: '120px',
          background: `radial-gradient(circle at top left, ${a.bg}, transparent 70%)`,
          opacity: 0,
          transition: 'opacity 0.3s',
        }}
        className="group-hover:!opacity-100"
      />

      {/* Icon */}
      <div
        style={{
          width: '44px', height: '44px',
          borderRadius: '12px',
          background: a.bg,
          border: `1px solid ${a.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          position: 'relative',
        }}
      >
        <Icon size={20} color={a.color} />
      </div>

      <h3
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: '#f1f5f9',
          marginBottom: '8px',
          position: 'relative',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: '14px',
          color: '#6B7280',
          lineHeight: 1.65,
          position: 'relative',
        }}
      >
        {description}
      </p>
    </motion.div>
  );
};

/* ── Problem/Solution Card ── */
export const ProblemSolutionCard = ({
  type,
  title,
  description,
  items,
  icon: Icon,
}: {
  type: 'problem' | 'solution';
  title: string;
  description: string;
  items: string[];
  icon: LucideIcon;
}) => {
  const isProblem = type === 'problem';
  return (
    <motion.div
      initial={{ opacity: 0, x: isProblem ? -24 : 24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      style={{
        padding: '28px',
        borderRadius: '16px',
        background: '#111827',
        border: isProblem
          ? '1px solid rgba(239,68,68,0.15)'
          : '1px solid rgba(16,185,129,0.15)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '20px' }}>
        <div
          style={{
            padding: '10px',
            borderRadius: '10px',
            background: isProblem ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
            color: isProblem ? '#f87171' : '#34d399',
          }}
        >
          <Icon size={20} />
        </div>
        <div>
          <p
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              color: isProblem ? '#f87171' : '#34d399',
              marginBottom: '4px',
            }}
          >
            {isProblem ? 'The Problem' : 'The Solution'}
          </p>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#f1f5f9' }}>{title}</h3>
        </div>
      </div>
      <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px', lineHeight: 1.65 }}>
        {description}
      </p>
      <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {items.map((item, idx) => (
          <li
            key={idx}
            style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: '#9CA3AF' }}
          >
            <span
              style={{
                marginTop: '6px',
                width: '6px', height: '6px',
                borderRadius: '50%',
                flexShrink: 0,
                background: isProblem ? '#f87171' : '#34d399',
              }}
            />
            {item}
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

/* ── Timeline Step ── */
export const TimelineStep = ({
  number,
  title,
  description,
  icon: Icon,
  isLast = false,
}: {
  number: number;
  title: string;
  description: string;
  icon: LucideIcon;
  isLast?: boolean;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: number * 0.09 }}
      style={{ position: 'relative' }}
    >
      {!isLast && (
        <div
          style={{
            position: 'absolute',
            left: '21px',
            top: '52px',
            width: '2px',
            height: '40px',
            background: 'linear-gradient(to bottom, rgba(99,102,241,0.4), transparent)',
          }}
        />
      )}

      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Circle */}
        <div style={{ flexShrink: 0 }}>
          <div
            style={{
              width: '44px', height: '44px',
              borderRadius: '50%',
              border: '1.5px solid rgba(99,102,241,0.4)',
              background: 'rgba(99,102,241,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8',
            }}
          >
            <Icon size={18} />
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, paddingBottom: '28px' }}>
          <p
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#6366F1',
              marginBottom: '4px',
            }}
          >
            Step {number}
          </p>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#f1f5f9', marginBottom: '6px' }}>
            {title}
          </h3>
          <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.65 }}>{description}</p>
        </div>
      </div>
    </motion.div>
  );
};

/* ── CTA Button ── */
export const CTAButton = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  className?: string;
}) => {
  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: '#4F46E5',
      color: '#fff',
      border: 'none',
      boxShadow: '0 2px 8px rgba(0,0,0,0.25), 0 4px 16px rgba(99,102,241,0.2)',
    },
    secondary: {
      background: 'rgba(255,255,255,0.06)',
      color: '#f1f5f9',
      border: '1px solid rgba(255,255,255,0.12)',
    },
    outline: {
      background: 'transparent',
      color: '#f1f5f9',
      border: '1.5px solid rgba(255,255,255,0.2)',
    },
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '8px 16px', fontSize: '13px' },
    md: { padding: '11px 22px', fontSize: '15px' },
    lg: { padding: '14px 28px', fontSize: '16px' },
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, translateY: -1 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        borderRadius: '12px',
        fontWeight: 600,
        fontFamily: 'Inter, system-ui, sans-serif',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        ...variantStyles[variant],
        ...sizeStyles[size],
      }}
      className={className}
    >
      {children}
      {Icon && <Icon size={15} />}
    </motion.button>
  );
};

/* ── Glass Card ── */
export const GlassCard = ({
  children,
  className = '',
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      style={{
        padding: '24px',
        borderRadius: '16px',
        background: '#111827',
        border: '1px solid rgba(255,255,255,0.07)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      className={`hover:border-indigo-500/25 hover:shadow-[0_8px_28px_rgba(0,0,0,0.35)] ${className}`}
    >
      {children}
    </motion.div>
  );
};

/* ── Empty State ── */
export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: () => void;
  actionLabel?: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '56px 16px', textAlign: 'center' }}
    >
      <div
        style={{
          marginBottom: '20px',
          padding: '16px',
          borderRadius: '50%',
          background: 'rgba(99,102,241,0.1)',
          border: '1px solid rgba(99,102,241,0.18)',
        }}
      >
        <Icon size={32} color="#818cf8" />
      </div>
      <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#f1f5f9', marginBottom: '8px' }}>{title}</h3>
      <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '28px', maxWidth: '320px', lineHeight: 1.65 }}>
        {description}
      </p>
      {action && actionLabel && (
        <CTAButton onClick={action} size="md">
          {actionLabel}
        </CTAButton>
      )}
    </motion.div>
  );
};

/* ── Loading State ── */
export const LoadingState = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          style={{
            width: '36px', height: '36px',
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.08)',
            borderTop: '2px solid #6366F1',
          }}
        />
        <p style={{ fontSize: '13px', color: '#6B7280' }}>Loading…</p>
      </div>
    </motion.div>
  );
};
