import { ArrowRight, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden z-10">
      {/* Video Background */}
      <div className="absolute inset-0 z-0 opacity-60 mix-blend-screen mask-image-b">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover"
          poster="/assets/videos/hero-poster.webp"
        >
          <source src="/assets/videos/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-background"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center mt-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel text-xs font-medium text-primary mb-8 border-primary/20">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          全新 UQ71 系列现已发布
        </div>
        
        <h1 className="text-[72px] font-bold tracking-tight mb-6 max-w-5xl leading-[1.1]">
          <span className="text-gradient">0延迟，全掌控</span>
        </h1>

        <p className="text-[28px] font-medium text-zinc-400 mb-6 max-w-5xl leading-snug">
          重塑你的输入体验
        </p>
        
        <p className="text-[16px] text-zinc-400 max-w-2xl mb-12 leading-relaxed">
          基于先进磁感应芯片的磁悬浮轴体，摒弃传统物理弹簧。
          <br className="hidden md:block" />
          8000Hz 竞技级回报率，每一次敲击都精准无误。
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link to="/products" className="group relative w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-xl font-medium transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]">
            <span>查看产品</span>
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
          
          <a href="https://drivers.szycdy.com/" target="_blank" rel="noopener noreferrer" className="group w-full sm:w-auto flex items-center justify-center gap-2 glass-panel px-8 py-4 rounded-xl font-medium text-white transition-all hover:bg-white/10 hover:border-white/20 cursor-pointer">
            <Globe size={18} />
            <span>在线驱动</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
