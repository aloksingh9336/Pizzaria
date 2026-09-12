import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { endpoints } from '../../services/api';
import DeliveryMap from '../../components/DeliveryMap';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const STAGES = ['Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered'];
const STAGE_ICON = ['🧾', '👨‍🍳', '🛵', '✅'];

export default function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState('');
  const load = () => endpoints.orderDetail(id).then((r) => setOrder(r.data.order)).catch(() => setErr('Order not found'));

  useEffect(() => { load(); }, [id]);
  useEffect(() => {
    const s = io(SOCKET_URL);
    const token = localStorage.getItem('token');
    s.on('connect', () => { if (token) s.emit('join', { token }); });
    s.on('order:status', (p) => {
      if (String(p.orderId) === String(id)) setOrder((o) => (o ? { ...o, status: p.status } : o));
    });
    const poll = setInterval(load, 6000);
    return () => { clearInterval(poll); s.disconnect(); };
  }, [id]);

  const simulateNext = () => {
    if (!order) return;
    const idx = STAGES.indexOf(order.status);
    if (idx >= STAGES.length - 1) return;
    const next = STAGES[idx + 1];
    setOrder((o) => ({ ...o, status: next }));
  };

  if (err) return <div className="max-w-xl mx-auto p-8 card text-center"><p className="font-bold">{err}</p><Link to="/dashboard" className="btn btn-primary mt-4 inline-block">Back to dashboard</Link></div>;
  if (!order) return <div className="max-w-xl mx-auto p-8">Loading tracking…</div>;

  const idx = STAGES.indexOf(order.status);
  const pct = Math.round(((idx + 1) / STAGES.length) * 100);
  const isPaid = order.paymentStatus === 'paid';

  return (
    <div className="max-w-3xl mx-auto px-4 pb-16">
      <div className="anim-fade-up mt-6 flex flex-wrap justify-between items-start gap-3">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Order {isPaid ? 'confirmed! 🎉' : 'tracking' }</h2>
          <p className="text-sm text-gray-500 font-mono">#{order._id.slice(-6)} · ₹{order.totalAmount} · <span className={`badge ${isPaid ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{order.paymentStatus}</span></p>
        </div>
        <Link to="/dashboard" className="btn btn-secondary text-sm">← Dashboard</Link>
      </div>

      {/* Stepper with progress + live map */}
      <div className="card mt-5 !p-5 anim-fade-up d1">
        <div className="flex justify-between items-center gap-1">
          {STAGES.map((s, i) => (
            <div key={s} className="flex-1 flex flex-col items-center gap-1.5">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all duration-500 ${i < idx ? 'bg-green-500 border-green-500 text-white' : i === idx ? 'text-white border-red-600 shadow-lg shadow-red-600/30' : 'bg-orange-50 border-orange-200 text-gray-400'}`}
                style={i === idx ? { background: 'linear-gradient(135deg,#F22B34,#B3121B)' } : undefined}>
                {i < idx ? '✓' : STAGE_ICON[i]}
              </div>
              <span className={`text-[11px] font-bold text-center leading-tight ${i <= idx ? 'text-gray-800' : 'text-gray-400'}`}>{s}</span>
            </div>
          ))}
        </div>
        <div className="h-2 rounded-full bg-orange-100 mt-4 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#FF8A3D,#E0262E)' }} />
        </div>
        <p className="text-[11px] text-gray-400 mt-2 text-center">Live via Socket.IO · polling fallback every 6s · Demo map below moves in real time</p>
      </div>

      {/* Demo Delivery Map */}
      <div className="mt-5">
        <h3 className="font-extrabold flex items-center gap-2">Live delivery tracking <span className="badge bg-red-50 text-red-600 border border-red-200 flex items-center gap-1"><span className="live-dot w-2 h-2 rounded-full bg-red-600 inline-block" />DEMO MAP</span></h3>
        <p className="text-xs text-gray-500">Store to you — rider animates automatically when order is “Sent to Delivery”. All demo, no real GPS.</p>
        <div className="mt-3">
          <DeliveryMap status={order.status} onSimulate={simulateNext} />
        </div>
      </div>

      {/* Order items */}
      <div className="card mt-5 !p-5 anim-fade-up">
        <h4 className="font-extrabold text-sm">Order items</h4>
        {order.items.map((it, i) => (
          <div key={i} className="text-sm border-b border-orange-100 py-2 flex justify-between gap-2">
            <span>{it.base} · {it.sauce} · {it.cheese} + {(it.vegetables || []).join(', ') || 'no veg'}</span>
            <span className="font-bold">₹{it.price}</span>
          </div>
        ))}
        <div className="flex justify-between font-extrabold mt-2"> <span>Total</span><span>₹{order.totalAmount}</span></div>
      </div>
    </div>
  );
}
