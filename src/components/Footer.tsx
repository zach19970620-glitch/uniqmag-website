import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="relative z-10 border-t border-white/5 bg-black/40 backdrop-blur-xl pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center mb-6 w-fit">
              <img src="/assets/logo.png" alt="UNIQMAG" className="h-8 w-auto" />
            </Link>
            <p className="text-zinc-400 text-sm max-w-sm mb-8">
              一家专注于磁力与 AI 技术的智能硬件公司。我们相信，好的键盘不只是工具，而是你和世界之间的桥梁。
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-6">快速链接</h4>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li><Link to="/products" className="hover:text-white transition-colors">所有产品</Link></li>
              <li><Link to="/software" className="hover:text-white transition-colors">驱动下载</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">关于我们</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">联系我们</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-6">支持</h4>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li><Link to="/support" className="hover:text-white transition-colors">常见问题</Link></li>
              <li><Link to="/support" className="hover:text-white transition-colors">发货政策</Link></li>
              <li><Link to="/support" className="hover:text-white transition-colors">退换货服务</Link></li>
              <li><Link to="/support" className="hover:text-white transition-colors">隐私政策</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
            <p>&copy; {new Date().getFullYear()} UNIQMAG 一磁定音. 保留所有权利。</p>
            <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">
              粤ICP备2026078796号
            </a>
          </div>
          <div className="flex gap-4">
            <Link to="/support" className="hover:text-zinc-300 transition-colors">服务条款</Link>
            <Link to="/support" className="hover:text-zinc-300 transition-colors">隐私政策</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
