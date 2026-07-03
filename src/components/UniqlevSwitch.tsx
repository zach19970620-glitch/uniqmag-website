import { motion, useReducedMotion } from 'framer-motion';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const UniqlevSwitch = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="uniqlev-heading"
      className="relative z-10 overflow-hidden bg-[#030303]"
    >
      <div
        className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute top-1/3 -left-32 w-96 h-96 rounded-full bg-amber-500/8 blur-[120px] pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute bottom-0 right-0 w-[480px] h-[480px] rounded-full bg-primary/10 blur-[140px] pointer-events-none"
        aria-hidden
      />

      <div className="container mx-auto px-6 py-24 md:py-32 lg:py-40">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 xl:gap-24 items-center">
          <motion.figure
            {...(reduceMotion ? {} : fadeUp(0))}
            className="relative order-1 lg:order-none"
          >
            <div
              className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-amber-500/10 via-transparent to-primary/10 blur-2xl opacity-60"
              aria-hidden
            />
            <div className="relative rounded-2xl md:rounded-3xl overflow-hidden border border-white/[0.06] shadow-[0_24px_80px_rgba(0,0,0,0.65)]">
              <img
                src="/assets/videos/消散.gif"
                alt="传统机械弹簧轴体消散，Uniqlev 无弹簧磁悬浮轴体取而代之"
                className="w-full h-auto object-cover"
                loading="lazy"
                decoding="async"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-[#030303]/40 via-transparent to-transparent pointer-events-none"
                aria-hidden
              />
            </div>
            <figcaption className="sr-only">
              左侧传统弹簧轴体化为粒子消散，右侧 Uniqlev 无弹簧磁悬浮轴体完整呈现
            </figcaption>
          </motion.figure>

          <div className="order-2 lg:order-none flex flex-col justify-center">
            <motion.div
              {...(reduceMotion ? {} : fadeUp(0.08))}
              className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/[0.06] text-[11px] font-medium tracking-[0.2em] uppercase text-amber-200/80 mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400/90" />
              Springless Magnetic Levitation
            </motion.div>

            <motion.h2
              id="uniqlev-heading"
              {...(reduceMotion ? {} : fadeUp(0.12))}
              className="text-[clamp(2rem,5vw,3.25rem)] font-bold leading-[1.15] tracking-tight mb-10"
            >
              <span className="block text-gradient">Uniqlev™ Switch</span>
              <span className="block mt-2 text-[clamp(1.5rem,3.5vw,2.25rem)] font-medium text-zinc-500 tracking-wide">
                Lev U Up
              </span>
            </motion.h2>

            <motion.p
              {...(reduceMotion ? {} : fadeUp(0.18))}
              className="text-zinc-400 text-[15px] md:text-base leading-[1.85] mb-8"
            >
              多年来，每一款磁轴键盘都依赖机械弹簧完成按键回弹。即使磁感应技术不断进化，弹簧依然是整个系统中最容易磨损和性能衰减的部件。随着使用时间增加，它会因疲劳和摩擦导致手感变化，影响触发一致性与精准度。
            </motion.p>

            <motion.div
              {...(reduceMotion ? {} : fadeUp(0.24))}
              className="relative pl-6 mb-8"
            >
              <span
                className="absolute left-0 top-1 bottom-1 w-px bg-gradient-to-b from-amber-400/80 via-amber-500/40 to-transparent"
                aria-hidden
              />
              <p className="text-lg md:text-xl font-semibold text-white leading-snug">
                Uniqlev™ 彻底改变了这一切。
              </p>
            </motion.div>

            <motion.p
              {...(reduceMotion ? {} : fadeUp(0.3))}
              className="text-zinc-300 text-[15px] md:text-base leading-[1.85]"
            >
              通过完全取消机械弹簧，Uniqlev™ 成为全球首款真正意义上的
              <span className="text-white font-medium">无弹簧磁悬浮开关</span>
              。磁力取代机械回弹，实现全程无接触、无摩擦运行，带来始终如一的按键手感、更高的触发精度，以及远超传统磁轴的耐久性与可靠性。
            </motion.p>

            <motion.ul
              {...(reduceMotion ? {} : fadeUp(0.36))}
              className="flex flex-wrap gap-3 mt-10 pt-8 border-t border-white/[0.06]"
              aria-label="Uniqlev 核心优势"
            >
              {['无接触', '无摩擦', '始终如一'].map((item) => (
                <li
                  key={item}
                  className="px-4 py-2 rounded-full text-xs font-medium tracking-wide text-zinc-300 border border-white/[0.08] bg-white/[0.03]"
                >
                  {item}
                </li>
              ))}
            </motion.ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UniqlevSwitch;
