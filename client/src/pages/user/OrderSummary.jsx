import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { endpoints } from '../../services/api';
import RazorpayCheckout from '../../components/RazorpayCheckout';

export default function OrderSummary() {
  const nav = useNavigate();
  const draft = JSON.parse(sessionStorage.getItem('pizzaDraft') || 'null');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showPay, setShowPay] = useState(false);
  const [payInfo, setPayInfo] = useState(null);
  const [orderId, setOrderId] = useState(null);

  if (!draft) return <div className="p-8">No pizza in draft. <a href="/builder" className="underline">Build one</a></div>;

  const placeOrder = async () => {
    setBusy(true); setError('');
    try {
      const r = await endpoints.createOrder(draft);
      setOrderId(r.data.order._id);
      const p = await endpoints.createPayment(r.data.order._id);
      setPayInfo(p.data);
      setShowPay(true);
    } catch (e) { setError(e.response?.data?.message || 'Failed to create order'); }
    finally { setBusy(false); }
  };

  return (
    <div className="max-w-xl mx-auto px-4 pb-16">
      <h2 className="text-2xl font-extrabold anim-fade-up">Order Summary</h2>
      <div className="card mt-4 anim-fade-up d1">
        {draft.items.map((it, i) => (
          <div key={i} className="text-sm border-b border-orange-100 py-3 flex justify-between gap-3">
            <div>
              <div><b>Base:</b> {it.base} · <b>Sauce:</b> {it.sauce} · <b>Cheese:</b> {it.cheese}</div>
              <div className="text-gray-500"><b>Veggies:</b> {it.vegetables.join(', ') || 'none'}</div>
            </div>
            <div className="font-extrabold text-red-600 whitespace-nowrap">₹{it.price}</div>
          </div>
        ))}
        <div className="flex justify-between items-center mt-3">
          <span className="text-gray-500 text-sm">Total payable</span>
          <span className="font-extrabold text-xl">₹{draft.totalAmount}</span>
        </div>
        <button className="btn btn-primary w-full mt-4" disabled={busy} onClick={placeOrder}>{busy ? 'Placing…' : 'Proceed to Payment →'}</button>
        {error && <p className="text-red-600 text-sm mt-2 font-semibold bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}
      </div>

      {showPay && payInfo && (
        <RazorpayCheckout
          orderId={orderId}
          payInfo={payInfo}
          amount={draft.totalAmount}
          onSuccess={() => { sessionStorage.removeItem('pizzaDraft'); nav(`/tracking/${orderId}`); }}
          onClose={() => setShowPay(false)}
        />
      )}
    </div>
  );
}
