import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { endpoints } from '../../services/api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const STATUSES = ['', 'Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    endpoints.adminOrders(filter || undefined).then((r) => setOrders(r.data.orders)).finally(() => setLoading(false));
  };
  useEffect(() => { setLoading(true); load(); }, [filter]);
  useEffect(() => {
    const s = io(SOCKET_URL);
    const t = localStorage.getItem('adminToken');
    s.on('connect', () => { if (t) s.emit('join', { adminToken: t }); s.emit('join:admin'); });
    s.on('order:created', () => load());
    s.on('order:status', (p) => setOrders((prev) => prev.map((o) => (o._id === p.orderId ? { ...o, status: p.status } : o))));
    return () => s.disconnect();
  }, []);

  const setStatus = async (id, status) => {
    await endpoints.adminPatchOrder(id, { status });
    setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status } : o)));
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold">Order Management</h2>
      <div className="mt-3 flex gap-2 items-center">
        <label className="text-sm">Filter:</label>
        <select className="border rounded px-2 py-1" value={filter} onChange={(e) => setFilter(e.target.value)}>
          {STATUSES.map((s) => <option key={s} value={s}>{s || 'All'}</option>)}
        </select>
        <button className="btn btn-secondary text-sm" onClick={load}>Refresh</button>
      </div>
      {loading ? <p className="mt-4">Loading...</p> : (
        <div className="card mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left border-b"><th>ID</th><th>User</th><th>Total</th><th>Pay</th><th>Status</th><th>Change</th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className="border-b">
                  <td className="font-mono py-2">{o._id.slice(-6)}</td>
                  <td>{o.user?.email}</td>
                  <td>₹{o.totalAmount}</td>
                  <td>{o.paymentStatus}</td>
                  <td className="font-bold">{o.status}</td>
                  <td>
                    <select className="border rounded px-1" value={o.status} onChange={(e) => setStatus(o._id, e.target.value)}>
                      {STATUSES.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!orders.length && <p className="text-sm text-gray-500 py-4">No orders.</p>}
        </div>
      )}
    </div>
  );
}
