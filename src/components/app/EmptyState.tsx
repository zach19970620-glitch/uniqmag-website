import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionTo?: string;
  children?: ReactNode;
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  actionTo,
  children,
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-14 text-center">
      <h3 className="text-lg font-medium text-white">{title}</h3>
      {description ? (
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-zinc-400">
          {description}
        </p>
      ) : null}
      {actionLabel && actionTo ? (
        <Link
          to={actionTo}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
        >
          {actionLabel}
        </Link>
      ) : null}
      {children}
    </div>
  );
}
