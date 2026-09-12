import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { endpoints } from '../../services/api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const STAGES = ['Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered'];

export default function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState('');
  const load = () => endpoints.orderDetail(id).then((r) => setOrder(r.data.order)).catch((e) => setErr('Not found'));

  useEffect(() => { load(); }, [id]);
  useEffect(() => {
    const s = io(SOCKET_URL);
    const token = localStorage.getItem('token');
    s.on('connect', () => { if (token) s.emit('join', { token }); });
    s.on('order:status', (p) => {
      if (p.orderId === id) setOrder((o) => (o ? { ...o, status: p.status } : o));
    });
    const poll = setInterval(load, 6000);
    return () => { clearInterval(poll); s.disconnect(); };
  }, [id]);

  if (err) return <div className="p-8">{err} <Link to="/dashboard" className="underline">Back</Link></div>;
  if (!order) return <div className="p-8">Loading...</div>;
  const idx = STAGES.indexOf(order.status);
  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-bold">Order confirmed! 🎉</h2>
      <div className="card mt-4">
        <div className="text-sm">Order <b className="font-mono">{order._id}</b> · ₹{order.totalAmount} · {order.paymentStatus}</div>
        <div className="mt-4 space-y-2">
          {STAGES.map((s, i) => (
            <div key={s} className={`p-2 rounded ${i <= idx ? 'bg-green-100 font-bold' : 'bg-gray-100 text-gray-500'}`}>
              {i <= idx ? '✅' : '⏳'} {s}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">Live updates via Socket.IO (polling fallback every 6s).</p>
        <Link to="/dashboard" className="btn btn-secondary inline-block mt-4">Back to dashboard</Link>
      </div>
    </div>
  );
}
