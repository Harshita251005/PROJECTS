import { useAuth } from '../context/AuthContext';

/**
 * RoleGuard Component
 * Renders children only if user has one of the specified roles
 * 
 * @param {string[]} roles - Array of allowed roles
 * @param {React.ReactNode} children - Content to render if authorized
 * @param {React.ReactNode} fallback - Optional content to render if unauthorized
 */
const RoleGuard = ({ roles = [], children, fallback = null }) => {
  const { user, hasRole } = useAuth();

  // If no user, don't render anything
  if (!user) {
    return fallback;
  }

  // If user has one of the required roles, render children
  if (hasRole(...roles)) {
    return children;
  }

  // Otherwise render fallback
  return fallback;
};

/**
 * AdminOnly - Convenience wrapper for admin-only content
 */
export const AdminOnly = ({ children, fallback = null }) => (
  <RoleGuard roles={['admin']} fallback={fallback}>
    {children}
  </RoleGuard>
);

/**
 * OrganizerOnly - Convenience wrapper for organizer/admin content
 */
export const OrganizerOnly = ({ children, fallback = null }) => (
  <RoleGuard roles={['organizer', 'admin']} fallback={fallback}>
    {children}
  </RoleGuard>
);



/**
 * ParticipantOnly - Convenience wrapper for participant content
 */
export const ParticipantOnly = ({ children, fallback = null }) => (
  <RoleGuard roles={['participant']} fallback={fallback}>
    {children}
  </RoleGuard>
);

export default RoleGuard;
