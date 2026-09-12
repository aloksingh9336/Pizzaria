import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useAdmin } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { admin, adminLogout } = useAdmin();
  const nav = useNavigate();
  const isAdminRoute = window.location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <nav className="bg-gray-900 text-white px-4 py-3 flex justify-between items-center">
        <Link to="/admin/inventory" className="font-bold text-lg">🍕 Pizzaria Admin</Link>
        <div className="flex gap-3 items-center">
          <Link to="/admin/inventory" className="hover:underline">Inventory</Link>
          <Link to="/admin/orders" className="hover:underline">Orders</Link>
          {admin ? (
            <><span className="text-sm text-gray-300">{admin.email}</span>
            <button className="btn btn-secondary text-black text-sm" onClick={() => { adminLogout(); nav('/admin/login'); }}>Logout</button></>
          ) : <Link to="/admin/login" className="hover:underline">Login</Link>}
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-red-700 text-white px-4 py-3 flex justify-between items-center">
      <Link to="/" className="font-bold text-xl">🍕 Pizzaria</Link>
      <div className="flex gap-3 items-center">
        <Link to="/" className="hover:underline">Menu</Link>
        {user ? (
          <>
            <Link to="/dashboard" className="hover:underline">My Orders</Link>
            <Link to="/builder" className="bg-white text-red-700 px-3 py-1 rounded font-bold">Build Pizza</Link>
            <span className="text-sm">{user.name}</span>
            <button className="bg-red-900 px-3 py-1 rounded text-sm" onClick={() => { logout(); nav('/'); }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/register" className="bg-white text-red-700 px-3 py-1 rounded font-bold">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
