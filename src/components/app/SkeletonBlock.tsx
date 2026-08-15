export default function SkeletonBlock({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-white/[0.06] ${className}`}
      aria-hidden
    />
  );
}
