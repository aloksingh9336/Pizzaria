import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { endpoints } from '../../services/api';

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

  const payMock = async (success) => {
    try {
      await endpoints.verifyPayment(orderId, {
        razorpay_payment_id: success ? `pay_mock_${Date.now()}` : 'pay_failed',
        razorpay_order_id: payInfo.razorpayOrderId,
        simulateSuccess: success,
      });
      if (success) { sessionStorage.removeItem('pizzaDraft'); nav(`/tracking/${orderId}`); }
      else setError('Payment failed (simulated).');
    } catch (e) { setError(e.response?.data?.message || 'Verification failed'); }
    setShowPay(false);
  };

  const payRazorpay = () => {
    // Real Razorpay checkout if keys present and not mock
    if (payInfo.mock || !window.Razorpay) { return; }
    const rzp = new window.Razorpay({
      key: payInfo.keyId,
      amount: payInfo.amount,
      currency: 'INR',
      name: 'Pizzaria',
      description: 'Pizza order',
      order_id: payInfo.razorpayOrderId,
      handler: async (resp) => {
        try {
          await endpoints.verifyPayment(orderId, { ...resp, simulateSuccess: false });
          sessionStorage.removeItem('pizzaDraft'); nav(`/tracking/${orderId}`);
        } catch { setError('Payment verification failed'); }
      },
      modal: { ondismiss: () => setShowPay(false) },
    });
    rzp.open();
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-bold">Order Summary</h2>
      <div className="card mt-4">
        {draft.items.map((it, i) => (
          <div key={i} className="text-sm border-b py-2">
            <div><b>Base:</b> {it.base} · <b>Sauce:</b> {it.sauce} · <b>Cheese:</b> {it.cheese}</div>
            <div><b>Veggies:</b> {it.vegetables.join(', ') || 'none'}</div>
            <div className="font-bold">₹{it.price}</div>
          </div>
        ))}
        <div className="font-extrabold text-lg mt-2">Total: ₹{draft.totalAmount}</div>
        <button className="btn btn-primary w-full mt-4" disabled={busy} onClick={placeOrder}>{busy ? 'Placing...' : 'Proceed to Payment'}</button>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </div>

      {showPay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-lg">Razorpay Checkout (Test Mode)</h3>
            <p className="text-sm text-gray-600 mt-1">Order: {payInfo.razorpayOrderId} · ₹{payInfo.amount / 100} {payInfo.mock ? '(MOCK)' : ''}</p>
            {!payInfo.mock && <button className="btn btn-primary w-full mt-3" onClick={payRazorpay}>Pay with Razorpay</button>}
            <div className="grid grid-cols-2 gap-2 mt-3">
              <button className="btn btn-primary" onClick={() => payMock(true)}>Simulate Success</button>
              <button className="btn btn-secondary" onClick={() => payMock(false)}>Simulate Failure</button>
            </div>
            <button className="text-sm underline mt-3" onClick={() => setShowPay(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
