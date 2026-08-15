interface ProductCoverProps {
  src?: string | null;
  alt: string;
  className?: string;
}

export default function ProductCover({ src, alt, className = '' }: ProductCoverProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`object-cover ${className}`}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-zinc-800/80 to-zinc-950 text-zinc-500 text-xs tracking-wider ${className}`}
      aria-label={alt}
    >
      UNIQMAG
    </div>
  );
}
