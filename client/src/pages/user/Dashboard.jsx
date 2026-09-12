import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { endpoints } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const STAGES = ['Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered'];

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const load = () => {
    endpoints.myOrders().then((r) => setOrders(r.data.orders)).catch((e) => setError(e.response?.data?.message || 'Failed')).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  // Socket live updates + polling fallback every 8s
  useEffect(() => {
    const s = io(SOCKET_URL);
    const token = localStorage.getItem('token');
    s.on('connect', () => { if (token) s.emit('join', { token }); });
    s.on('order:status', (p) => {
      setOrders((prev) => prev.map((o) => (o._id === p.orderId ? { ...o, status: p.status, paymentStatus: p.paymentStatus || o.paymentStatus } : o)));
    });
    const poll = setInterval(load, 8000);
    return () => { clearInterval(poll); s.disconnect(); };
  }, []);

  const active = orders.filter((o) => o.status !== 'Delivered');
  const past = orders.filter((o) => o.status === 'Delivered');

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Hi {user?.name} — your orders</h2>
        <Link to="/builder" className="btn btn-primary">+ New Pizza</Link>
      </div>
      {loading && <p className="mt-4">Loading...</p>}
      {error && <p className="text-red-600 mt-4">{error}</p>}
      <h3 className="font-bold mt-6">Active ({active.length}) — live ⚡</h3>
      <div className="grid gap-3 mt-2">
        {active.map((o) => <OrderCard key={o._id} order={o} />)}
        {!active.length && !loading && <p className="text-gray-500 text-sm">No active orders.</p>}
      </div>
      <h3 className="font-bold mt-6">Past ({past.length})</h3>
      <div className="grid gap-3 mt-2">
        {past.map((o) => <OrderCard key={o._id} order={o} />)}
      </div>
    </div>
  );
}

function OrderCard({ order }) {
  const idx = STAGES.indexOf(order.status);
  return (
    <div className="card">
      <div className="flex justify-between items-center">
        <span className="font-mono text-xs text-gray-500">#{order._id.slice(-6)}</span>
        <span className={`badge ${order.paymentStatus === 'paid' ? 'bg-green-200 text-green-900' : 'bg-yellow-200 text-yellow-900'}`}>{order.paymentStatus}</span>
      </div>
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {STAGES.map((s, i) => (
          <span key={s} className={`badge flex items-center justify-center text-center leading-tight min-h-[2rem] px-1 ${i <= idx ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-500'}`}>{s}</span>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t flex justify-between items-center gap-2">
        <span className="text-sm text-gray-700">₹{order.totalAmount} · {order.items.length} pizza(s) · {new Date(order.createdAt).toLocaleString()}</span>
        <Link to={`/tracking/${order._id}`} className="text-sm font-semibold text-red-700 hover:underline whitespace-nowrap">Track →</Link>
      </div>
    </div>
  );
}
