import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

/* ============================================================
   DESIGN SYSTEM COMPONENTS — Enterprise SaaS (Stripe / Linear)
   Theme-aware: uses CSS variables for dark/light support
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
  const variantClasses: Record<string, string> = {
    default: 'bg-primary/10 border-primary/20 text-primary',
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
    warning: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
    error: 'bg-red-500/10 border-red-500/20 text-red-500',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${variantClasses[variant]}`}
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
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
          {eyebrow}
        </p>
      )}
      <h2 className="text-[clamp(1.875rem,4vw,2.75rem)] font-extrabold leading-[1.15] tracking-[-0.02em] text-foreground">
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-3 text-base leading-relaxed text-muted-foreground ${align === 'center' ? 'mx-auto' : ''}`} style={{ maxWidth: '540px' }}>
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
  const accentClasses = {
    indigo: { iconBg: 'bg-primary/10 border-primary/20', iconColor: 'text-primary' },
    blue:   { iconBg: 'bg-blue-500/10 border-blue-500/20', iconColor: 'text-blue-500' },
  };
  const a = accentClasses[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="group relative cursor-default overflow-hidden rounded-2xl border border-border/70 bg-card p-6 transition-all duration-200 hover:border-primary/25 hover:shadow-[var(--shadow-card-hover)]"
    >
      <div className="pointer-events-none absolute left-0 top-0 h-[120px] w-[120px] rounded-full bg-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className={`relative mb-4 flex h-11 w-11 items-center justify-center rounded-xl border ${a.iconBg}`}>
        <Icon size={20} className={a.iconColor} />
      </div>

      <h3 className="relative mb-2 text-base font-semibold text-foreground">
        {title}
      </h3>
      <p className="relative text-sm leading-relaxed text-muted-foreground">
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
      className={`rounded-2xl border bg-card p-7 ${isProblem ? 'border-destructive/15' : 'border-emerald-500/15'}`}
    >
      <div className="mb-5 flex items-start gap-3.5">
        <div className={`rounded-xl p-2.5 ${isProblem ? 'bg-destructive/10 text-destructive' : 'bg-emerald-500/10 text-emerald-500'}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className={`mb-1 text-[11px] font-bold uppercase tracking-[0.07em] ${isProblem ? 'text-destructive' : 'text-emerald-500'}`}>
            {isProblem ? 'The Problem' : 'The Solution'}
          </p>
          <h3 className="text-xl font-bold text-foreground">{title}</h3>
        </div>
      </div>
      <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <ul className="flex flex-col gap-2.5">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2.5 text-sm text-muted-foreground">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${isProblem ? 'bg-destructive' : 'bg-emerald-500'}`} />
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
      className="relative"
    >
      {!isLast && (
        <div className="absolute left-[21px] top-[52px] h-10 w-0.5 bg-gradient-to-b from-primary/40 to-transparent" />
      )}
      <div className="flex gap-5">
        <div className="shrink-0">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-primary/40 bg-primary/10 text-primary">
            <Icon size={18} />
          </div>
        </div>
        <div className="flex-1 pb-7">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.06em] text-primary">
            Step {number}
          </p>
          <h3 className="mb-1.5 text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
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
  const variantClasses: Record<string, string> = {
    primary: 'bg-primary text-primary-foreground shadow-[var(--shadow-primary)]',
    secondary: 'bg-card border border-border text-foreground',
    outline: 'bg-transparent border-[1.5px] border-border text-foreground',
  };

  const sizeClasses: Record<string, string> = {
    sm: 'px-4 py-2 text-[13px]',
    md: 'px-5 py-2.5 text-[15px]',
    lg: 'px-7 py-3.5 text-base',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, translateY: -1 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl font-semibold transition-all duration-150 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
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
      className={`rounded-2xl border border-border/70 bg-card p-6 transition-all duration-200 hover:border-primary/25 hover:shadow-[var(--shadow-card-hover)] ${onClick ? 'cursor-pointer' : 'cursor-default'} ${className}`}
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
      className="flex flex-col items-center px-4 py-14 text-center"
    >
      <div className="mb-5 rounded-full border border-primary/20 bg-primary/10 p-4">
        <Icon size={32} className="text-primary" />
      </div>
      <h3 className="mb-2 text-xl font-bold text-foreground">{title}</h3>
      <p className="mb-7 max-w-[320px] text-sm leading-relaxed text-muted-foreground">
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
      className="flex items-center justify-center py-12"
    >
      <div className="flex flex-col items-center gap-3.5">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-border border-t-primary" />
        <p className="text-[13px] text-muted-foreground">Loading…</p>
      </div>
    </motion.div>
  );
};
