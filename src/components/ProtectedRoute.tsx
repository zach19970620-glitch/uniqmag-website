import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, needsProfile, bootstrapping } = useAuth();
  const location = useLocation();

  if (bootstrapping) {
    return (
      <section className="relative z-10 min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-zinc-500" size={28} />
      </section>
    );
  }

  if (!isAuthenticated) {
    // 保留 query（支付宝回跳 /pay/result?out_trade_no=... 依赖此字段）
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  if (needsProfile && location.pathname !== '/onboarding/nickname') {
    return <Navigate to="/onboarding/nickname" replace />;
  }

  return <>{children}</>;
}
