import { motion, useReducedMotion } from 'framer-motion';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const TmrSensor = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="tmr-heading"
      className="relative z-10 overflow-hidden bg-background"
    >
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(102,105,227,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(102,105,227,0.5) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
        aria-hidden
      />
      <div
        className="absolute top-0 right-1/4 w-[520px] h-[520px] rounded-full bg-cyan-500/6 blur-[140px] pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute bottom-1/4 -left-24 w-80 h-80 rounded-full bg-primary/12 blur-[100px] pointer-events-none"
        aria-hidden
      />

      <div className="container mx-auto px-6 py-24 md:py-32 lg:py-40">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-12 lg:gap-16 xl:gap-24 items-center">
          <div className="flex flex-col justify-center lg:pr-4">
            <motion.div
              {...(reduceMotion ? {} : fadeUp(0))}
              className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] text-[11px] font-medium tracking-[0.2em] uppercase text-cyan-200/75 mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/90 animate-pulse" />
              Tunnel Magnetoresistance
            </motion.div>

            <motion.h2
              id="tmr-heading"
              {...(reduceMotion ? {} : fadeUp(0.08))}
              className="text-[clamp(2rem,5vw,3.25rem)] font-bold leading-[1.2] tracking-tight mb-8"
            >
              <span className="text-gradient">TMR 传感技术</span>
              <span className="block mt-3 text-[clamp(1.25rem,3vw,1.75rem)] font-medium text-zinc-500">
                释放极致性能
              </span>
            </motion.h2>

            <motion.p
              {...(reduceMotion ? {} : fadeUp(0.16))}
              className="text-zinc-400 text-[15px] md:text-base leading-[1.85] mb-10 max-w-xl"
            >
              基于 TMR（隧道磁阻）传感器，系统可实现
              <span className="text-cyan-200/90 font-medium">亚毫秒级</span>
              按键触发检测。所有信号均在硬件层实时处理，有效规避软件处理延迟，确保每一次输入都精准、高效且稳定。
            </motion.p>

            <motion.dl
              {...(reduceMotion ? {} : fadeUp(0.24))}
              className="grid grid-cols-3 gap-3 max-w-xl"
            >
              {[
                { term: '触发精度', value: '亚毫秒级' },
                { term: '信号处理', value: '硬件实时' },
                { term: '系统延迟', value: '规避软件层' },
              ].map(({ term, value }) => (
                <div
                  key={term}
                  className="glass-panel rounded-xl px-4 py-4 border-cyan-400/10"
                >
                  <dt className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1.5">
                    {term}
                  </dt>
                  <dd className="text-sm font-semibold text-zinc-200 leading-snug">
                    {value}
                  </dd>
                </div>
              ))}
            </motion.dl>
          </div>

          <motion.figure
            {...(reduceMotion ? {} : fadeUp(0.12))}
            className="relative"
          >
            <div
              className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-bl from-cyan-400/12 via-primary/8 to-transparent blur-3xl opacity-70"
              aria-hidden
            />
            <div className="relative rounded-2xl md:rounded-3xl overflow-hidden border border-white/[0.08] shadow-[0_32px_100px_rgba(0,0,0,0.55)]">
              <div
                className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-primary/10 pointer-events-none z-10"
                aria-hidden
              />
              <img
                src="/assets/about/TMR_Chip.webp"
                alt="TMR 隧道磁阻传感芯片特写"
                className="w-full h-auto object-cover scale-[1.02]"
                loading="lazy"
                decoding="async"
              />
              <div
                className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/60 to-transparent pointer-events-none z-10"
                aria-hidden
              />
            </div>
            <figcaption className="sr-only">TMR 隧道磁阻传感芯片</figcaption>

            {!reduceMotion && (
              <div
                className="absolute -bottom-3 -right-3 md:-bottom-4 md:-right-4 w-24 h-24 md:w-28 md:h-28 rounded-full border border-cyan-400/20 pointer-events-none"
                aria-hidden
              >
                <div className="absolute inset-2 rounded-full border border-cyan-400/10" />
                <div className="absolute inset-0 rounded-full border border-dashed border-cyan-400/15 animate-[spin_24s_linear_infinite]" />
              </div>
            )}
          </motion.figure>
        </div>
      </div>
    </section>
  );
};

export default TmrSensor;
