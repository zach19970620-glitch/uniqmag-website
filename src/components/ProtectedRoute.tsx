import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  BIND_MOBILE_PATH,
  nextOnboardingPath,
  type OnboardingHandoff,
} from '../lib/onboarding';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, needsProfile, bootstrapping } = useAuth();
  const location = useLocation();
  const from = `${location.pathname}${location.search}`;
  const handoff: OnboardingHandoff = { from, resume: location.state };
  const onboarding = nextOnboardingPath({
    profileCompleted: !needsProfile,
  });

  if (bootstrapping) {
    return (
      <section className="relative z-10 min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-zinc-500" size={28} />
      </section>
    );
  }

  if (!isAuthenticated) {
    // 保留 query（支付宝回跳 /pay/result?out_trade_no=... 依赖此字段）
    return <Navigate to="/login" replace state={{ from }} />;
  }

  if (onboarding && location.pathname !== onboarding) {
    return <Navigate to={onboarding} replace state={handoff} />;
  }

  return <>{children}</>;
}

/** 下单 / 订单 / 地址等业务页：未绑手机则去绑定（可跳过回个人中心） */
export function RequireMobile({ children }: { children: React.ReactNode }) {
  const { needsBindMobile } = useAuth();
  const location = useLocation();

  if (!needsBindMobile) return <>{children}</>;

  const handoff: OnboardingHandoff = {
    from: `${location.pathname}${location.search}`,
    resume: location.state,
    required: true,
  };
  return <Navigate to={BIND_MOBILE_PATH} replace state={handoff} />;
}
