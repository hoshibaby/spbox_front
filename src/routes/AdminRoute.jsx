import { Navigate } from 'react-router-dom';

export default function AdminRoute({ children }) {
  const raw = localStorage.getItem('auth');
  const auth = raw && raw !== 'null' ? JSON.parse(raw) : null;

  if (!auth?.token) return <Navigate to="/login" replace />;
  if (auth?.role !== 'ADMIN') return <Navigate to="/me/messages" replace />;

  return children;
}
