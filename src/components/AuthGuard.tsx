
import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface AuthGuardProps {
  requireAuth?: boolean;
  redirectTo?: string;
  isAdminOnly?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ 
  requireAuth = false,
  redirectTo = requireAuth ? "/login" : "/dashboard",
  isAdminOnly = false
}) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // Check if user is admin (replace this with your actual admin check logic)
  const isAdmin = user?.email === "admin@zapbot.com" || user?.email === "seu@email.com";

  // If still loading auth state, show a loading indicator
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-t-whatsapp rounded-full animate-spin"></div>
      </div>
    );
  }

  // For admin-only routes: if not admin, redirect to dashboard
  if (isAdminOnly && !isAdmin) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  // For protected routes: if not authenticated, redirect to login
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // For public routes (login, register): if already authenticated, redirect to dashboard
  if (!requireAuth && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Otherwise, render the children
  return <Outlet />;
};

export default AuthGuard;
