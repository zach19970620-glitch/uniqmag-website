import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: '首页', href: '/' },
    { name: '产品', href: '/products' },
    { name: '软件', href: '/software' },
    { name: '支持', href: '/support' },
    { name: '关于我们', href: '/about' },
    { name: '联系我们', href: '/contact' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'py-3 bg-black/60 backdrop-blur-xl'
          : 'py-5 bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between px-2 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="UNIQMAG" className="h-6 sm:h-7 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.href}
                className={`text-sm transition-colors ${
                  location.pathname === link.href 
                    ? 'text-white font-medium' 
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 mt-2 px-6 pb-4">
          <div className="glass-panel rounded-2xl p-4 flex flex-col gap-4 bg-black/60">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.href}
                className={`text-sm px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === link.href
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-zinc-300 hover:text-white hover:bg-white/5'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
