import { NavLink } from 'react-router-dom';

const LINKS = [
  { to: '/account', label: '概览', end: true },
  { to: '/account/orders', label: '订单' },
  { to: '/account/addresses', label: '地址' },
  { to: '/account/points', label: '积分' },
  { to: '/account/devices', label: '设备' },
];

export default function AccountNav() {
  return (
    <nav
      aria-label="个人中心"
      className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none"
    >
      {LINKS.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) =>
            `shrink-0 rounded-full px-4 py-2 text-sm transition-colors duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              isActive
                ? 'bg-white text-black font-medium'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
