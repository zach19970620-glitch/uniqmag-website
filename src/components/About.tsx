import { motion } from 'framer-motion';
import aboutData from '../data/about.json';

const About = () => {
  const { teamMembers, coreTech, milestones, hero } = aboutData;

  return (
    <div className="pt-24 pb-32 relative z-10">
      {/* Hero Section */}
      <section className="container mx-auto px-6 mb-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="glass-panel rounded-3xl overflow-hidden border border-white/10 relative min-h-[60vh] flex items-center"
        >
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent z-10"></div>
            <img 
              src={hero.bannerImage} 
              alt="About UNIQMAG" 
              className="w-full h-full object-cover opacity-60 mix-blend-luminosity"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-black -z-10"></div>
          </div>

          <div className="relative z-10 p-10 md:p-16 lg:p-24 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-md text-xs font-medium text-zinc-300 mb-8 border border-white/10 tracking-widest uppercase">
              {hero.tagline}
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight">
              {hero.title}<br/>
              <span className="text-gradient">{hero.titleHighlight}</span>
            </h1>
            
            <div className="space-y-6 text-zinc-300 text-lg leading-relaxed font-light">
              {hero.intro.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Brand Story */}
      <section className="container mx-auto px-6 mb-32">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">品牌故事</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-transparent mx-auto rounded-full"></div>
          </motion.div>

          <div className="space-y-12 text-lg text-zinc-400 font-light leading-relaxed">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              UNIQMAG 团队致力于重新定义你与计算机的交互方式。我们的技术核心，是基于先进磁感应芯片的磁悬浮轴体，摒弃传统物理弹簧，实现更顺滑、更一致的触发行程。
            </motion.p>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              由此诞生的键盘支持 8000Hz 回报率，确保每一次输入在高强度竞技中都能精准注册。
            </motion.p>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              我们更进一步，将 AI 驱动能力融入设计：键盘可学习用户偏好，随使用习惯进化，成为管理外设、优化游戏与专业工作流的智能控制中枢。独创的三模磁轴配置支持动态性能调节，在卓越触觉反馈之上，让每位用户都能将按键响应微调至最适合自己的手感。
            </motion.p>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-white text-xl font-medium">
              我们的愿景很简单：以先进技术与精密工程取胜，摒弃不必要的浮华，从根本上升级键盘的核心性能，服务玩家与专业人士。
            </motion.p>
          </div>

          <motion.blockquote 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mt-20 p-10 glass-panel rounded-3xl border-l-4 border-l-primary relative overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 text-9xl text-white/5 font-serif">"</div>
            <p className="text-2xl italic text-white font-light leading-relaxed relative z-10">
              "UNIQMAG 是一家创新的智能硬件公司，处于磁力与 AI 技术的前沿。我们的使命是通过磁学创新与 AI 驱动的精密交互，革新人机关系，交付极致的用户体验。"
            </p>
            <footer className="mt-6 text-primary font-medium tracking-wide relative z-10">— UNIQMAG CEO</footer>
          </motion.blockquote>
        </div>
      </section>

      {/* Core Technology */}
      <section className="container mx-auto px-6 mb-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">核心技术</h2>
          <p className="text-zinc-400 text-lg">突破物理局限，重塑输入体验</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {coreTech.map((tech, idx) => (
            <motion.div 
              key={tech.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass-panel p-8 rounded-3xl glass-panel-hover group"
            >
              <div className="text-4xl mb-6 bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-primary/20 group-hover:border-primary/50 transition-all duration-500">
                {tech.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{tech.title}</h3>
              <p className="text-zinc-400 leading-relaxed font-light">{tech.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="container mx-auto px-6 mb-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">核心团队</h2>
          <p className="text-zinc-400 text-lg">汇聚顶尖工程与设计力量</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {teamMembers.map((member, idx) => (
            <motion.div 
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass-panel rounded-3xl overflow-hidden group"
            >
              <div className="h-80 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                />
                <div className="absolute bottom-6 left-6 z-20">
                  <h3 className="text-2xl font-bold text-white mb-1">{member.name}</h3>
                  <p className="text-primary font-medium text-sm tracking-wide uppercase">{member.role}</p>
                </div>
              </div>
              <div className="p-6">
                <p className="text-zinc-400 font-light leading-relaxed">{member.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Milestones */}
      <section className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">发展历程</h2>
          <p className="text-zinc-400 text-lg">每一步，都在重新定义可能</p>
        </motion.div>

        <div className="max-w-5xl mx-auto relative">
          {/* Vertical Line */}
          <div className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-white/10 to-transparent -translate-x-1/2"></div>

          <div className="space-y-24">
            {milestones.map((milestone, idx) => (
              <motion.div 
                key={`${milestone.date}-${milestone.title}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className={`flex flex-col md:flex-row gap-8 md:gap-16 relative ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-[28px] md:left-1/2 top-0 w-4 h-4 rounded-full bg-black border-2 border-primary -translate-x-1/2 translate-y-2 shadow-[0_0_15px_rgba(102,105,227,0.8)] z-10"></div>

                {/* Date (Mobile: top, Desktop: opposite side) */}
                <div className={`md:w-1/2 flex ${idx % 2 === 0 ? 'md:justify-start' : 'md:justify-end'} pl-16 md:pl-0`}>
                  <div className="text-primary font-mono text-xl md:text-3xl tracking-tighter sticky top-32">
                    {milestone.date}
                  </div>
                </div>

                {/* Content */}
                <div className={`md:w-1/2 pl-16 md:pl-0 ${idx % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                  <div className="glass-panel p-8 rounded-3xl hover:border-primary/30 transition-colors duration-500">
                    <h3 className="text-2xl font-bold text-white mb-4">{milestone.title}</h3>
                    <p className="text-zinc-400 font-light leading-relaxed mb-6">{milestone.desc}</p>
                    
                    <div className="rounded-2xl overflow-hidden border border-white/5 relative aspect-video bg-white/5">
                      <img 
                        src={milestone.image} 
                        alt={milestone.title}
                        className="w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal transition-all duration-700"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
