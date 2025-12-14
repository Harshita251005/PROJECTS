import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute Component
 * Protects routes requiring authentication and optionally specific roles
 * 
 * @param {React.ReactNode} children - Content to render if authorized
 * @param {string[]} roles - Optional array of allowed roles (if not specified, any authenticated user can access)
 * @param {string} redirectTo - Where to redirect unauthorized users (default: /login)
 */
const ProtectedRoute = ({ children, roles = [], redirectTo = '/login' }) => {
  const { isAuthenticated, loading, user, hasRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // If roles are specified, check if user has required role
  if (roles.length > 0 && !hasRole(...roles)) {
    // Redirect to appropriate dashboard based on user role
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (user?.role === 'organizer') {
      return <Navigate to="/dashboard" replace />;
    } else if (user?.role === 'judge') {
      return <Navigate to="/judge" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

