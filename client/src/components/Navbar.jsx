import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useAdmin } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { admin, adminLogout } = useAdmin();
  const nav = useNavigate();
  const isAdminRoute = window.location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <nav className="sticky top-0 z-50 text-white px-4 py-3 flex justify-between items-center shadow-lg" style={{ background: 'linear-gradient(135deg,#2B2118,#4a3220)' }}>
        <Link to="/admin/inventory" className="font-extrabold text-lg tracking-tight">🍕 Pizzaria <span className="text-xs font-bold bg-red-600 rounded-full px-2 py-0.5 ml-1">ADMIN</span></Link>
        <div className="flex gap-4 items-center text-sm">
          <Link to="/admin/inventory" className="hover:text-amber-300 transition">Inventory</Link>
          <Link to="/admin/orders" className="hover:text-amber-300 transition">Orders</Link>
          {admin ? (
            <><span className="text-orange-200/80 hidden sm:inline">{admin.email}</span>
            <button className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full text-sm transition" onClick={() => { adminLogout(); nav('/admin/login'); }}>Logout</button></>
          ) : <Link to="/admin/login" className="hover:text-amber-300 transition">Login</Link>}
        </div>
      </nav>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-[#FFF6EC]/90 backdrop-blur border-b border-orange-100">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="w-10 h-10 rounded-2xl flex items-center justify-center text-2xl text-white shadow-lg shadow-red-600/30 group-hover:rotate-12 transition-transform" style={{ background: 'linear-gradient(135deg,#F22B34,#B3121B)' }}>🍕</span>
          <span className="leading-tight">
            <span className="block font-extrabold text-xl tracking-tight italic">Pizzaria</span>
            <span className="block text-[11px] text-orange-800/70 font-medium -mt-0.5">Great Taste. Delivered.</span>
          </span>
        </Link>
        <div className="flex gap-2 sm:gap-3 items-center">
          <Link to="/" className="hidden sm:inline text-sm font-semibold hover:text-red-600 transition">Menu</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="hidden sm:inline text-sm font-semibold hover:text-red-600 transition">My Orders</Link>
              <Link to="/builder" className="btn btn-primary text-sm !py-2">Build Pizza</Link>
              <span className="text-sm font-bold text-orange-900/70 hidden md:inline">Hi, {user.name} 👋</span>
              <button className="text-sm text-gray-500 hover:text-red-600 transition" onClick={() => { logout(); nav('/'); }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold hover:text-red-600 transition">Login</Link>
              <Link to="/register" className="btn btn-primary text-sm !py-2">Sign up</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
