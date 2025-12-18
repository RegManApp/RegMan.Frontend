import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const RoleGuard = ({ children, allowedRoles = [], fallbackPath = '/dashboard' }) => {
  const { hasRole, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  const isAllowed = allowedRoles.some((role) => hasRole(role));

  if (!isAllowed) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

export default RoleGuard;
