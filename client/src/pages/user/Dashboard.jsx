import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { endpoints } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PizzaWhole } from '../../components/PizzaArt';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const STAGES = ['Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered'];
const TONES = ['classic', 'veggie', 'bbq', 'cheese'];

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

  const patchOrder = (id, data) =>
    setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, ...data } : o)));

  const active = orders.filter((o) => o.status !== 'Delivered');
  const past = orders.filter((o) => o.status === 'Delivered');
  const spent = orders.filter((o) => o.paymentStatus === 'paid').reduce((a, o) => a + o.totalAmount, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 pb-16">
      {/* Header */}
      <div className="anim-fade-up mt-6 rounded-[2rem] p-6 sm:p-7 text-white relative overflow-hidden shadow-xl shadow-red-900/20"
        style={{ background: 'linear-gradient(120deg,#2B2118 20%,#6b1a1a 75%,#8f1d1d)' }}>
        <div className="hero-texture absolute inset-0" />
        <div className="relative flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-extrabold text-white shadow-lg" style={{ background: 'linear-gradient(135deg,#F22B34,#B3121B)' }}>
              {(user?.name || 'P').charAt(0).toUpperCase()}
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Hi {user?.name} 👋</h2>
              <p className="text-orange-100/70 text-xs font-medium">Craving something cheesy today?</p>
            </div>
          </div>
          <Link to="/builder" className="btn btn-primary text-sm">+ New Pizza</Link>
        </div>
        <div className="relative grid grid-cols-3 gap-2.5 mt-5">
          {[
            [`${active.length}`, 'Active orders'],
            [`${past.length}`, 'Delivered'],
            [`₹${spent}`, 'Total savoured'],
          ].map(([v, l]) => (
            <div key={l} className="rounded-2xl bg-white/10 border border-white/10 px-3 py-2.5 text-center backdrop-blur">
              <div className="text-lg font-extrabold">{v}</div>
              <div className="text-[11px] text-orange-100/70 font-semibold">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {loading && (
        <div className="grid gap-3 mt-6">
          {[0, 1].map((i) => <div key={i} className="card !p-5 animate-pulse"><div className="h-4 bg-orange-100 rounded-full w-1/3" /><div className="h-8 bg-orange-100 rounded-2xl mt-3" /><div className="h-4 bg-orange-100 rounded-full w-2/3 mt-3" /></div>)}
        </div>
      )}
      {error && <p className="text-red-600 mt-4 card !py-3 text-sm font-semibold">{error}</p>}

      {!loading && !error && (
        <>
          <h3 className="font-extrabold mt-7 flex items-center gap-2 anim-fade-up">
            Active ({active.length})
            <span className="flex items-center gap-1.5 text-[11px] font-extrabold text-red-600 bg-red-50 border border-red-100 rounded-full px-2.5 py-1">
              <span className="live-dot w-2 h-2 rounded-full bg-red-600 inline-block" />LIVE
            </span>
          </h3>
          <div className="grid gap-4 mt-3">
            {active.map((o, i) => <OrderCard key={o._id} order={o} tone={TONES[i % TONES.length]} onPatch={patchOrder} />)}
            {!active.length && (
              <div className="card text-center py-8 anim-pop">
                <PizzaWhole tone="classic" size={110} className="mx-auto anim-float" />
                <p className="font-extrabold mt-3">No active orders</p>
                <p className="text-sm text-gray-500">The oven is waiting…</p>
                <Link to="/builder" className="btn btn-primary text-sm inline-block mt-4">Build your pizza →</Link>
              </div>
            )}
          </div>

          <h3 className="font-extrabold mt-8 anim-fade-up">Past ({past.length})</h3>
          <div className="grid gap-4 mt-3">
            {past.map((o, i) => <OrderCard key={o._id} order={o} tone={TONES[(i + 2) % TONES.length]} onPatch={patchOrder} />)}
            {!past.length && <p className="text-gray-400 text-sm">Nothing devoured yet.</p>}
          </div>
        </>
      )}
    </div>
  );
}

function describeItems(order) {
  return order.items.map((it) => {
    const veg = (it.vegetables || []).length ? ` +${it.vegetables.length} veg` : '';
    return `${it.base} · ${it.cheese}${veg}`;
  });
}

function OrderCard({ order, tone, onPatch }) {
  const nav = useNavigate();
  const idx = STAGES.indexOf(order.status);
  const pct = Math.round(((idx + 1) / STAGES.length) * 100);
  const [paying, setPaying] = useState(false);
  const [payInfo, setPayInfo] = useState(null);
  const [payErr, setPayErr] = useState('');
  const [busy, setBusy] = useState(false);
  const eta = order.status === 'Delivered' ? 'Delivered' : `${25 + (3 - Math.min(idx, 3)) * 8}–${35 + (3 - Math.min(idx, 3)) * 8} min`;

  const startPay = async () => {
    setPayErr(''); setBusy(true);
    try {
      const p = await endpoints.createPayment(order._id);
      setPayInfo(p.data); setPaying(true);
    } catch (e) { setPayErr(e.response?.data?.message || 'Could not start payment'); }
    finally { setBusy(false); }
  };

  const finishPay = async (success) => {
    try {
      await endpoints.verifyPayment(order._id, {
        razorpay_payment_id: success ? `pay_mock_${Date.now()}` : 'pay_failed',
        razorpay_order_id: payInfo.razorpayOrderId,
        simulateSuccess: success,
      });
      setPaying(false);
      if (success) onPatch(order._id, { paymentStatus: 'paid', status: 'Order Received' });
      else setPayErr('Payment failed (simulated). Try again.');
    } catch (e) { setPayErr(e.response?.data?.message || 'Verification failed'); setPaying(false); }
  };

  const reorder = () => {
    sessionStorage.setItem('pizzaDraft', JSON.stringify({ items: order.items, totalAmount: order.totalAmount }));
    nav('/summary');
  };

  return (
    <div className="card card-hover !p-5 anim-fade-up">
      <div className="flex gap-4">
        <div className="hidden sm:flex flex-col items-center shrink-0">
          <PizzaWhole tone={tone} size={92} />
          <span className="text-[11px] font-bold text-gray-400 mt-1">#{order._id.slice(-6)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center gap-2">
            <span className="font-mono text-xs text-gray-400 sm:hidden">#{order._id.slice(-6)}</span>
            <span className="text-xs font-bold text-orange-800/70 hidden sm:inline">🛵 ETA · {eta}</span>
            <span className={`badge ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
              {order.paymentStatus === 'paid' ? '● paid' : '● pending'}
            </span>
          </div>

          {describeItems(order).map((d, i) => (
            <div key={i} className="font-bold text-sm mt-1.5 truncate">🍕 {d}</div>
          ))}

          {/* stepper */}
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {STAGES.map((s, i) => (
              <span key={s} title={s} className={`badge flex items-center justify-center text-center leading-tight min-h-[2rem] px-1 transition-all duration-500 ${i <= idx ? 'text-white shadow-md shadow-red-600/25' : 'bg-orange-50 text-gray-400 border border-orange-100'}`}
                style={i <= idx ? { background: 'linear-gradient(135deg,#F22B34,#B3121B)' } : undefined}>
                {i < idx ? '✓ ' : ''}{s}
              </span>
            ))}
          </div>
          <div className="h-1.5 rounded-full bg-orange-100 mt-2 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#FF8A3D,#E0262E)' }} />
          </div>

          <div className="mt-3 pt-3 border-t border-orange-100 flex flex-wrap justify-between items-center gap-2">
            <span className="text-sm text-gray-600 font-medium">₹{order.totalAmount} · {order.items.length} pizza(s) · {new Date(order.createdAt).toLocaleString()}</span>
            <div className="flex gap-2 items-center">
              {order.paymentStatus !== 'paid' && (
                <button onClick={startPay} disabled={busy} className="btn btn-primary !py-1.5 !px-4 text-xs">{busy ? '…' : 'Pay now'}</button>
              )}
              <button onClick={reorder} className="btn btn-secondary !py-1.5 !px-4 text-xs">↻ Reorder</button>
              <Link to={`/tracking/${order._id}`} className="text-xs font-extrabold text-red-600 hover:underline whitespace-nowrap">Track →</Link>
            </div>
          </div>
          {payErr && <p className="text-red-600 text-xs font-semibold mt-2">{payErr}</p>}
        </div>
      </div>

      {paying && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full anim-pop">
            <h3 className="font-extrabold text-lg">Complete payment 💳</h3>
            <p className="text-sm text-gray-500 mt-1">₹{order.totalAmount} · Test mode (MOCK)</p>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button className="btn btn-primary text-sm" onClick={() => finishPay(true)}>Simulate Success</button>
              <button className="btn btn-secondary text-sm" onClick={() => finishPay(false)}>Simulate Failure</button>
            </div>
            <button className="text-sm underline mt-3 text-gray-500" onClick={() => setPaying(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
