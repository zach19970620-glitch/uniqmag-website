import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Zap, Shield, Cpu, Sliders, Crosshair } from 'lucide-react';

// 产品数据
const productsData = {
  uq68: {
    id: 'uq68',
    name: 'UQ68',
    slogan: '全性能释放，紧凑型磁悬浮键盘',
    tags: ['68%配列', '全铝机身', '磁悬浮', '8K回报率'],
    themeColor: '#6669e3',
    bgColor: '#08121a',
    colors: [
      { name: '雾透蓝', hex: '#5EEAD4', image: '/media/products/uq68/18-product-misty-blue.webp' },
      { name: '克莱因蓝', hex: '#0057B7', image: '/media/products/uq68/01-product-klein-blue.webp' },
      { name: '橙色', hex: '#F97316', image: '/media/products/uq68/03-product-detail-3.webp' },
      { name: '玫瑰红', hex: '#E11D48', image: '/media/products/uq68/05-product-rose-red-1.webp' }
    ],
    highlights: [
      { title: 'UNILEV 磁悬浮轴', desc: '零机械磨损，顺滑一致的触发行程', icon: <Cpu size={24} /> },
      { title: '8K 回报率', desc: '竞技级性能释放，毫秒级响应', icon: <Zap size={24} /> },
      { title: 'TMR 传感器', desc: '0.005mm 触发精度，极致微调', icon: <Crosshair size={24} /> },
      { title: '独家深渊灯效', desc: 'RGB 全彩可控，沉浸式视觉体验', icon: <Sliders size={24} /> }
    ],
    specs: [
      { label: '轴体', value: 'UNILEV 磁悬浮轴' },
      { label: '重量', value: '约 1.35kg' },
      { label: '热插拔', value: '支持' },
      { label: '背光', value: 'RGB · 深渊灯效' },
      { label: '机身', value: '全铝' },
      { label: '配列', value: '68%' },
      { label: '目标用户', value: '电竞 · 紧凑派' }
    ],
    scenarios: ['电竞游戏', '深度定制', '紧凑高效']
  },
  uq71: {
    id: 'uq71',
    name: 'UQ71',
    slogan: '全球首创无弹簧磁悬浮键盘',
    tags: ['71%配列', '全铝机身', '磁悬浮', '8K回报率'],
    themeColor: '#e7e5e4',
    bgColor: '#0c0c0e',
    colors: [
      { name: '复古白', hex: '#E7E5E4', image: '/media/products/uq71/02-product-retro-white.webp' },
      { name: '红色', hex: '#DC2626', image: '/media/products/uq71/01-product-red.webp' },
      { name: '锖色', hex: '#78716C', image: '/media/products/uq71/06-product-detail-1.webp' }
    ],
    highlights: [
      { title: '全球首创无弹簧设计', desc: 'UNILEV 磁悬浮技术，颠覆传统手感', icon: <Cpu size={24} /> },
      { title: '8K 回报率', desc: '竞技级性能释放，毫秒级响应', icon: <Zap size={24} /> },
      { title: 'TMR 传感器', desc: '0.005mm 触发精度，极致微调', icon: <Crosshair size={24} /> },
      { title: '全铝机身', desc: '高级表面处理，旗舰级质感', icon: <Shield size={24} /> }
    ],
    specs: [
      { label: '轴体', value: 'UNILEV 磁悬浮轴' },
      { label: '重量', value: '约 1.6kg' },
      { label: '热插拔', value: '支持' },
      { label: '背光', value: 'RGB' },
      { label: '机身', value: '全铝' },
      { label: '配列', value: '71%' },
      { label: '目标用户', value: '旗舰 · 质感派' }
    ],
    scenarios: ['电竞游戏', '深度定制', '旗舰质感']
  }
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const product = id ? productsData[id as keyof typeof productsData] : null;
  
  const [activeColorIdx, setActiveColorIdx] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20">
        <h1 className="text-4xl font-bold mb-4">产品未找到</h1>
        <Link to="/products" className="text-primary hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> 返回产品列表
        </Link>
      </div>
    );
  }

  const activeColor = product.colors[activeColorIdx];

  return (
    <div className="pt-24 pb-32 relative z-10" style={{ backgroundColor: product.bgColor }}>
      {/* Background Glow */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-[150px] opacity-20 pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: activeColor.hex }}
      ></div>

      <div className="container mx-auto px-6 relative z-10">
        <Link to="/products" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> 返回列表
        </Link>

        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row gap-16 items-center mb-32">
          {/* Image Gallery */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-3/5 w-full relative"
          >
            <div className="glass-panel rounded-3xl p-4 sm:p-12 aspect-square md:aspect-video lg:aspect-square flex items-center justify-center relative overflow-hidden">
              <img 
                key={activeColor.image}
                src={activeColor.image} 
                alt={`${product.name} - ${activeColor.name}`} 
                className="w-full h-full object-contain drop-shadow-2xl scale-110 animate-in fade-in zoom-in-95 duration-700 relative z-10"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-2/5 w-full"
          >
            <div className="flex flex-wrap gap-2 mb-6">
              {product.tags.map(tag => (
                <span key={tag} className="text-xs font-medium px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300">
                  {tag}
                </span>
              ))}
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">{product.name}</h1>
            <p className="text-xl text-zinc-400 mb-10 pb-10 border-b border-white/10">{product.slogan}</p>

            {/* Color Selection */}
            <div className="mb-10">
              <h3 className="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-wider">选择颜色 : <span className="text-white ml-2">{activeColor.name}</span></h3>
              <div className="flex flex-wrap gap-4">
                {product.colors.map((color, idx) => (
                  <button
                    key={color.name}
                    onClick={() => setActiveColorIdx(idx)}
                    className={`w-12 h-12 rounded-full transition-all duration-300 relative flex items-center justify-center ${
                      activeColorIdx === idx 
                        ? 'ring-2 ring-white ring-offset-4 ring-offset-black scale-110' 
                        : 'opacity-70 hover:opacity-100 hover:scale-110 border border-white/20'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {activeColorIdx === idx && (
                      <Check size={20} className={['#E7E5E4', '#5EEAD4'].includes(color.hex) ? 'text-black' : 'text-white'} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Highlights */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-32"
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">核心亮点</h2>
            <div className="w-24 h-1 mx-auto rounded-full" style={{ background: `linear-gradient(to right, ${product.themeColor}, transparent)` }}></div>
          </div>
          
          <div className={`grid gap-6 ${product.highlights.length === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'}`}>
            {product.highlights.map((item, idx) => (
              <div key={idx} className="glass-panel p-8 rounded-3xl glass-panel-hover group">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-500"
                  style={{ backgroundColor: `${product.themeColor}20`, color: product.themeColor }}
                >
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-zinc-400 leading-relaxed font-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tech Specs */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-panel rounded-3xl p-8 md:p-16 border border-white/10"
        >
          <div className="flex flex-col md:flex-row gap-16">
            <div className="md:w-1/3">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">技术规格</h2>
              <p className="text-zinc-400 leading-relaxed mb-8">
                精工细作，每一处细节都为极致体验而生。探索 {product.name} 的完整技术参数。
              </p>
              <div className="flex flex-wrap gap-2">
                {product.scenarios.map(scenario => (
                  <span key={scenario} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-zinc-300">
                    {scenario}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="md:w-2/3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                {product.specs.map((spec, idx) => (
                  <div key={idx} className="py-4 border-b border-white/5 flex flex-col gap-1">
                    <span className="text-sm text-zinc-500">{spec.label}</span>
                    <span className="text-lg text-white font-medium">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetail;
