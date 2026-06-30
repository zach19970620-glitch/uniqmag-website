import { type ReactNode } from 'react';
import { Settings2, SlidersHorizontal, Keyboard, Zap, Globe, Download, AlertCircle, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import softwareData from '../data/software.json';

const featureIconMap: Record<string, ReactNode> = {
  settings: <Settings2 size={20} />,
  sliders: <SlidersHorizontal size={20} />,
  zap: <Zap size={20} />,
  keyboard: <Keyboard size={20} />,
};

const Software = () => {
  const { hero, notice, driver, firmwares } = softwareData;

  return (
    <div className="pt-24 pb-32 relative z-10">
      <section className="container mx-auto px-6 mb-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-md text-xs font-medium text-zinc-300 mb-8 border border-white/10 tracking-widest uppercase">
            {hero.tagline}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">{hero.title}</h1>
          <p className="text-zinc-400 text-lg">{hero.subtitle}</p>
        </motion.div>
      </section>

      <section id="driver" className="relative mb-32">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-6 relative">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          <div className="lg:w-1/2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel text-xs font-medium text-blue-400 mb-6 border-blue-400/20">
              <Globe size={14} />
              {driver.badge}
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              {driver.title}<br />
              <span className="text-gradient">{driver.titleHighlight}</span>
            </h2>
            
            <p className="text-zinc-400 text-lg mb-10 leading-relaxed">
              {driver.description}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
              {driver.features.map((feature) => (
                <div key={feature.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-primary shrink-0">
                    {featureIconMap[feature.icon]}
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-1">{feature.title}</h4>
                    <p className="text-sm text-zinc-500">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-4 relative z-10 pb-4">
              <a href={driver.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(102,105,227,0.4)]">
                <Globe size={18} />
                <span>打开网页驱动</span>
              </a>
            </div>
          </div>
          
          <div className="lg:w-1/2 w-full">
            <div className="glass-panel rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative">
              <div className="h-12 bg-white/5 border-b border-white/10 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="mx-auto text-xs font-medium text-zinc-500">UQ Driver - uq68</div>
              </div>
              
              <div className="p-6 bg-black/40 backdrop-blur-md relative h-[400px]">
                <div className="absolute left-0 top-0 bottom-0 w-16 border-r border-white/5 flex flex-col items-center py-6 gap-6">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center"><Settings2 size={16} /></div>
                  <div className="w-8 h-8 rounded-lg text-zinc-600 flex items-center justify-center"><Keyboard size={16} /></div>
                  <div className="w-8 h-8 rounded-lg text-zinc-600 flex items-center justify-center"><Zap size={16} /></div>
                </div>
                
                <div className="ml-16 pl-6 h-full flex flex-col">
                  <div className="flex justify-between items-end mb-8">
                    <div>
                      <h3 className="text-lg font-medium text-white">触发行程</h3>
                      <p className="text-xs text-zinc-500">全局设置</p>
                    </div>
                    <div className="text-2xl font-light text-primary">1.2<span className="text-sm text-zinc-500 ml-1">mm</span></div>
                  </div>
                  
                  <div className="flex-1 border border-white/5 rounded-xl bg-white/[0.02] relative overflow-hidden p-4">
                    <div className="absolute inset-0 flex flex-col justify-between py-8 opacity-20">
                      <div className="w-full border-t border-white/10 dashed"></div>
                      <div className="w-full border-t border-white/10 dashed"></div>
                      <div className="w-full border-t border-white/10 dashed"></div>
                      <div className="w-full border-t border-white/10 dashed"></div>
                    </div>
                    
                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <path d="M0,80 C30,80 40,20 100,20" fill="none" stroke="var(--primary)" strokeWidth="2" />
                      <path d="M0,80 C30,80 40,20 100,20 L100,100 L0,100 Z" fill="url(#gradient)" opacity="0.2" />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="var(--primary)" />
                          <stop offset="100%" stopColor="transparent" />
                        </linearGradient>
                      </defs>
                    </svg>
                    
                    <div className="absolute left-[40%] top-[20%] w-4 h-4 rounded-full bg-white border-2 border-primary shadow-[0_0_10px_var(--primary)] -translate-x-1/2 -translate-y-1/2 cursor-pointer"></div>
                    <div className="absolute left-[40%] top-[20%] bottom-0 border-l border-primary/50 border-dashed -translate-x-1/2"></div>
                  </div>
                  
                  <div className="mt-6 flex gap-4">
                    <div className="flex-1 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center px-4 justify-between">
                      <span className="text-xs text-zinc-400">触发行程</span>
                      <span className="text-sm text-white">1.2 mm</span>
                    </div>
                    <div className="flex-1 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center px-4 justify-between">
                      <span className="text-xs text-zinc-400">断开行程</span>
                      <span className="text-sm text-white">0.8 mm</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
      </section>

      <section className="container mx-auto px-6 mb-24">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto glass-panel p-6 md:p-8 rounded-2xl border-l-4 border-l-primary flex gap-4 md:gap-6 items-start bg-gradient-to-r from-primary/10 to-transparent"
        >
          <div className="text-primary shrink-0 mt-1">
            <AlertCircle size={28} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">{notice.title}</h3>
            <p className="text-zinc-300 leading-relaxed">{notice.content}</p>
          </div>
        </motion.div>
      </section>

      <section className="container mx-auto px-6 mb-32">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
              <Cpu size={24} />
            </div>
            <h2 className="text-3xl font-bold">固件下载</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {firmwares.map((fw, idx) => (
              <motion.div 
                key={fw.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="glass-panel p-8 rounded-3xl glass-panel-hover flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-3xl font-bold text-white mb-1">{fw.model}</h3>
                    <p className="text-primary font-medium text-sm">{fw.slogan}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                    <Download size={20} />
                  </div>
                </div>
                
                <p className="text-zinc-400 font-light leading-relaxed mb-8 flex-grow">
                  {fw.desc}
                </p>
                
                <a 
                  href={fw.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white hover:text-black text-white font-medium text-center transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  <Download size={18} className="group-hover:-translate-y-1 transition-transform" />
                  <span>下载 {fw.model} 固件</span>
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Software;
