import { Navigate } from 'react-router-dom';
import { useAuth, useAdmin } from '../context/AuthContext';

export function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <div className="p-8">Loading...</div>;
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export function AdminRoute({ children }) {
  const { admin } = useAdmin();
  const token = localStorage.getItem('adminToken');
  if (!token || !admin) return <Navigate to="/admin/login" replace />;
  return children;
}
