import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ColorOption {
  name: string;
  hex: string;
  image: string;
}

interface Product {
  id: string;
  name: string;
  slogan: string;
  tags: string[];
  colors: ColorOption[];
}

const ProductCard = ({ product }: { product: Product }) => {
  const [activeColorIdx, setActiveColorIdx] = useState(0);
  const activeColor = product.colors[activeColorIdx];

  return (
    <div className="glass-panel rounded-3xl p-1 overflow-hidden group glass-panel-hover flex flex-col">
      <div className="relative h-96 sm:h-[420px] rounded-2xl overflow-hidden bg-gradient-to-b from-white/5 to-transparent flex items-center justify-center p-2">
        {/* Fallback image placeholder if actual image is missing */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <div className="w-64 h-32 rounded-xl border border-white/20 bg-white/5 flex items-center justify-center">
            Keyboard Image
          </div>
        </div>
        <img 
          key={activeColor.image} // Add key to force re-render and animation on change if needed
          src={activeColor.image} 
          alt={`${product.name} - ${activeColor.name}`} 
          className="relative z-10 w-full h-full object-contain drop-shadow-2xl transition-transform duration-700 scale-110 group-hover:scale-125 animate-in fade-in zoom-in-95"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[100px] opacity-20 transition-all duration-500 group-hover:opacity-40"
          style={{ backgroundColor: activeColor.hex }}
        ></div>
      </div>
      
      <div className="p-8 flex flex-col flex-grow">
        <div className="flex flex-wrap gap-2 mb-4">
          {product.tags.map(tag => (
            <span key={tag} className="text-xs font-medium px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300">
              {tag}
            </span>
          ))}
        </div>
        
        <h3 className="text-3xl font-bold mb-2">{product.name}</h3>
        <p className="text-zinc-400 mb-6 h-12">{product.slogan}</p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {product.colors.map((color, idx) => (
                <button
                  key={color.name}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveColorIdx(idx);
                  }}
                  className={`w-6 h-6 rounded-full transition-all duration-300 ${
                    activeColorIdx === idx 
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' 
                      : 'opacity-70 hover:opacity-100 hover:scale-110'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                  aria-label={color.name}
                />
              ))}
            </div>
            <span className="text-sm text-zinc-400 ml-2 hidden sm:block">{activeColor.name}</span>
          </div>
          
          <Link to={`/products/${product.id}`} className="flex items-center gap-2 bg-white/10 hover:bg-white text-white hover:text-black px-5 py-2.5 rounded-xl font-medium transition-all shrink-0">
            <span>了解更多</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

const Products = () => {
  const products: Product[] = [
    {
      id: 'uq68',
      name: 'UQ68',
      slogan: '全性能释放，紧凑型磁悬浮键盘',
      tags: ['68%配列', '全铝机身', '磁悬浮', '8K回报率'],
      colors: [
        { name: '雾透蓝', hex: '#5EEAD4', image: '/media/products/uq68/18-product-misty-blue.webp' },
        { name: '克莱因蓝', hex: '#0057B7', image: '/media/products/uq68/01-product-klein-blue.webp' },
        { name: '橙色', hex: '#F97316', image: '/media/products/uq68/03-product-detail-3.webp' },
        { name: '玫瑰红', hex: '#E11D48', image: '/media/products/uq68/05-product-rose-red-1.webp' }
      ]
    },
    {
      id: 'uq71',
      name: 'UQ71',
      slogan: '全球首创无弹簧磁悬浮键盘',
      tags: ['71%配列', '全铝机身', '磁悬浮', '0.005mm精度'],
      colors: [
        { name: '复古白', hex: '#E7E5E4', image: '/media/products/uq71/02-product-retro-white.webp' },
        { name: '红色', hex: '#DC2626', image: '/media/products/uq71/01-product-red.webp' },
        { name: '锖色', hex: '#78716C', image: '/media/products/uq71/06-product-detail-1.webp' }
      ]
    }
  ];

  return (
    <section id="products" className="py-32 relative z-10 min-h-screen flex items-center">
      <div className="container mx-auto px-6 mt-12">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gradient">探索磁悬浮系列</h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            专为竞技玩家与专业人士打造，将精密工程与前沿科技完美融合。
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Products;
