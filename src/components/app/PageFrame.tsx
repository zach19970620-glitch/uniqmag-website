import type { ReactNode } from 'react';

interface PageFrameProps {
  children: ReactNode;
  narrow?: boolean;
  className?: string;
}

/** 用户站页面外壳：继承站点 OLED 氛围，控制内容宽度与顶栏间距 */
export default function PageFrame({ children, narrow, className = '' }: PageFrameProps) {
  return (
    <section className={`relative z-10 min-h-[100dvh] pt-28 pb-20 ${className}`}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-16 left-[12%] h-72 w-72 rounded-full bg-primary/12 blur-[110px]" />
        <div className="absolute bottom-10 right-[8%] h-64 w-80 rounded-full bg-blue-500/10 blur-[100px]" />
      </div>
      <div
        className={`container relative mx-auto px-4 sm:px-6 ${
          narrow ? 'max-w-lg' : 'max-w-6xl'
        }`}
      >
        {children}
      </div>
    </section>
  );
}
