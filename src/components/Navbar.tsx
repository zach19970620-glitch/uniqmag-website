import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, ShoppingBag, X, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, needsProfile } = useAuth();
  const { count } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: '首页', href: '/' },
    { name: '产品', href: '/products' },
    { name: '软件', href: '/software' },
    { name: '支持', href: '/support' },
    { name: '关于我们', href: '/about' },
    { name: '联系我们', href: '/contact' },
  ];

  const accountActive =
    location.pathname.startsWith('/account') || location.pathname === '/onboarding/nickname';

  const displayName = user?.nickname?.trim() || '用户';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-3 bg-black/60 backdrop-blur-xl' : 'py-5 bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between px-2 py-3">
          <Link to="/" className="flex items-center">
            <img src="/assets/logo.png" alt="UNIQMAG" className="h-6 sm:h-7 w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const active =
                link.href === '/'
                  ? location.pathname === '/'
                  : location.pathname === link.href ||
                    location.pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`text-sm transition-colors ${
                    active ? 'text-white font-medium' : 'text-zinc-300 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/cart"
              className={`relative inline-flex items-center justify-center rounded-full border p-2 transition-colors ${
                location.pathname === '/cart'
                  ? 'border-white/20 bg-white/10 text-white'
                  : 'border-white/10 text-zinc-300 hover:text-white hover:bg-white/5'
              }`}
              aria-label="购物车"
            >
              <ShoppingBag size={16} strokeWidth={1.5} />
              {count > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-medium text-black tabular-nums">
                  {count > 99 ? '99+' : count}
                </span>
              ) : null}
            </Link>
            {isAuthenticated ? (
              <Link
                to={needsProfile ? '/onboarding/nickname' : '/account'}
                className={`inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border transition-colors ${
                  accountActive
                    ? 'border-white/20 bg-white/10 text-white'
                    : 'border-white/10 text-zinc-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center text-[10px] font-semibold">
                  {displayName.slice(0, 1).toUpperCase()}
                </span>
                {needsProfile ? '完善昵称' : displayName}
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-zinc-300 hover:text-white transition-colors px-2"
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="text-sm px-4 py-2 rounded-full bg-white text-black font-medium hover:bg-zinc-200 transition-colors"
                >
                  注册
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-300 hover:text-white transition-colors"
            aria-label="切换菜单"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 mt-2 px-6 pb-4">
          <div className="glass-panel rounded-2xl p-4 flex flex-col gap-2 bg-black/60">
            {navLinks.map((link) => {
              const active =
                link.href === '/'
                  ? location.pathname === '/'
                  : location.pathname === link.href ||
                    location.pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`text-sm px-4 py-2 rounded-lg transition-colors ${
                    active
                      ? 'bg-white/10 text-white font-medium'
                      : 'text-zinc-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <div className="border-t border-white/10 my-2" />
            <Link
              to="/cart"
              className={`text-sm px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2 ${
                location.pathname === '/cart'
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-zinc-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShoppingBag size={16} strokeWidth={1.5} />
              购物车{count > 0 ? ` (${count})` : ''}
            </Link>
            {isAuthenticated ? (
              <Link
                to={needsProfile ? '/onboarding/nickname' : '/account'}
                className={`text-sm px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2 ${
                  accountActive
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-zinc-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <UserRound size={16} />
                {needsProfile ? '完善昵称' : '个人中心'}
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm px-4 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="text-sm px-4 py-2 rounded-lg bg-white/10 text-white font-medium text-center"
                >
                  注册
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
