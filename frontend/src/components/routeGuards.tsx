import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from './ui';
import type { Role } from '../types';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader size={32} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}

export function RoleRoute({ allow }: { allow: Role[] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader size={32} />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (!allow.includes(user.role)) {
    const fallback = user.role === 'BRAND' ? '/brand' : user.role === 'INFLUENCER' ? '/influencer' : '/admin';
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}

export function GuestOnlyRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) {
    const fallback = user.role === 'BRAND' ? '/brand' : user.role === 'INFLUENCER' ? '/influencer' : '/admin';
    return <Navigate to={fallback} replace />;
  }
  return <Outlet />;
}
