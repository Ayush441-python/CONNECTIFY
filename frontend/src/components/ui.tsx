import { ButtonHTMLAttributes, forwardRef, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLoader, FiX, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

// ---------------- Button ----------------

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  icon?: ReactNode;
}

export function Button({ variant = 'primary', loading, icon, children, className = '', disabled, ...rest }: ButtonProps) {
  const cls = variant === 'primary' ? 'btn-primary' : variant === 'secondary' ? 'btn-secondary' : 'btn-ghost';
  return (
    <button className={`${cls} ${className}`} disabled={disabled || loading} {...rest}>
      {loading ? <FiLoader className="animate-spin" /> : icon}
      {children}
    </button>
  );
}

// ---------------- Inputs ----------------

interface FieldWrapProps {
  label?: string;
  error?: string;
  children: ReactNode;
}

function FieldWrap({ label, error, children }: FieldWrapProps) {
  return (
    <div>
      {label && <label className="label-field">{label}</label>}
      {children}
      {error && <p className="mt-1 text-xs font-medium text-brand-pink">{error}</p>}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className = '', ...rest },
  ref
) {
  return (
    <FieldWrap label={label} error={error}>
      <input ref={ref} className={`input-field ${error ? 'border-brand-pink/50' : ''} ${className}`} {...rest} />
    </FieldWrap>
  );
});

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { label, error, className = '', ...rest },
  ref
) {
  return (
    <FieldWrap label={label} error={error}>
      <textarea
        ref={ref}
        className={`input-field min-h-[110px] resize-y ${error ? 'border-brand-pink/50' : ''} ${className}`}
        {...rest}
      />
    </FieldWrap>
  );
});

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, className = '', children, ...rest },
  ref
) {
  return (
    <FieldWrap label={label} error={error}>
      <select ref={ref} className={`input-field ${error ? 'border-brand-pink/50' : ''} ${className}`} {...rest}>
        {children}
      </select>
    </FieldWrap>
  );
});

// ---------------- Multi-select chips (categories, languages) ----------------

interface ChipSelectProps {
  label?: string;
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
}

export function ChipSelect({ label, options, value, onChange }: ChipSelectProps) {
  const toggle = (opt: string) => {
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
  };
  return (
    <div>
      {label && <label className="label-field">{label}</label>}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = value.includes(opt);
          return (
            <button
              type="button"
              key={opt}
              onClick={() => toggle(opt)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                active ? 'bg-brand-gradient text-white shadow-glow' : 'border border-ink/10 bg-white text-ink/60 hover:border-brand-purple/30'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------- Glass Card ----------------

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className = '', hover = false }: GlassCardProps) {
  return <div className={`glass-card ${hover ? 'transition-all duration-300 hover:shadow-glass-lg hover:-translate-y-1' : ''} ${className}`}>{children}</div>;
}

// ---------------- Badge ----------------

const badgeTones: Record<string, string> = {
  neutral: 'bg-mist text-ink/60',
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-600',
  danger: 'bg-rose-50 text-rose-600',
  brand: 'bg-brand-gradient text-white',
};

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: keyof typeof badgeTones }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${badgeTones[tone]}`}>{children}</span>;
}

export function statusTone(status: string): keyof typeof badgeTones {
  if (['ACCEPTED', 'ACTIVE', 'COMPLETED'].includes(status)) return 'success';
  if (['REJECTED'].includes(status)) return 'danger';
  if (['PENDING', 'DRAFT'].includes(status)) return 'warning';
  return 'neutral';
}

// ---------------- Loader / Skeleton ----------------

export function Loader({ size = 24 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center py-10">
      <FiLoader className="animate-spin text-brand-purple" size={size} />
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-ink/[0.06] ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="glass-card overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function RowSkeleton() {
  return (
    <div className="glass-card flex items-center gap-4 p-4">
      <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="glass-card flex items-center gap-4 p-5">
      <Skeleton className="h-11 w-11 rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-14" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <RowSkeleton key={i} />
      ))}
    </div>
  );
}

// ---------------- Empty State ----------------

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl2 border border-dashed border-ink/10 bg-white/50 px-6 py-16 text-center">
      {icon && <div className="mb-4 text-4xl text-brand-purple/40">{icon}</div>}
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-ink/50">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl2 border border-brand-pink/15 bg-brand-pink/5 px-6 py-16 text-center">
      <div className="mb-4 text-4xl text-brand-pink/60">
        <FiAlertTriangle />
      </div>
      <h3 className="font-display text-lg font-semibold text-ink">Something went wrong</h3>
      <p className="mt-1.5 max-w-sm text-sm text-ink/50">{message || "We couldn't load this right now."}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-5" icon={<FiRefreshCw size={14} />} onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

// ---------------- Modal ----------------

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: string;
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={`glass-card w-full ${maxWidth} max-h-[85vh] overflow-y-auto scrollbar-thin bg-white/95 p-6`}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              {title && <h3 className="font-display text-xl font-semibold">{title}</h3>}
              <button onClick={onClose} className="ml-auto rounded-full p-1.5 text-ink/40 hover:bg-ink/5 hover:text-ink">
                <FiX />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------------- Avatar ----------------

export function Avatar({ src, name, size = 40 }: { src?: string | null; name: string; size?: number }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size }}
        className="rounded-full object-cover ring-2 ring-white"
      />
    );
  }
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className="flex items-center justify-center rounded-full bg-brand-gradient font-semibold text-white ring-2 ring-white"
    >
      {initials}
    </div>
  );
}