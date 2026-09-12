import { useEffect, useState } from 'react';
import { endpoints } from '../services/api';

// Realistic Razorpay-style checkout modal.
// Props: orderId, payInfo ({ razorpayOrderId, amount (paise), mock }), amount (rupees), onSuccess(order), onClose
export default function RazorpayCheckout({ orderId, payInfo, amount, onSuccess, onClose }) {
  const [method, setMethod] = useState('upi');
  const [upi, setUpi] = useState('');
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [bank, setBank] = useState('HDFC');
  const [wallet, setWallet] = useState('Paytm');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(null); // 'success' | 'fail'
  const [err, setErr] = useState('');
  const [qrTick, setQrTick] = useState(300); // 5:00

  const paise = payInfo?.amount ?? Math.round(amount * 100);
  const rupees = paise / 100;
  const orderRef = payInfo?.razorpayOrderId || `order_mock_${orderId?.slice(-6)}`;

  // QR countdown
  useEffect(() => {
    if (method !== 'qr' || processing || done) return;
    const t = setInterval(() => setQrTick((v) => (v > 0 ? v - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [method, processing, done]);

  // processing progress bar
  useEffect(() => {
    if (!processing) return;
    const t = setInterval(() => setProgress((p) => Math.min(100, p + Math.random() * 18 + 6)), 220);
    return () => clearInterval(t);
  }, [processing]);

  const upiValid = /^[a-z0-9._-]{2,}@[a-z]{2,}$/i.test(upi);

  const verify = async (success) => {
    setProcessing(true); setProgress(12); setErr('');
    // realistic delay + progress
    await new Promise((r) => setTimeout(r, 1600));
    try {
      const res = await endpoints.verifyPayment(orderId, {
        razorpay_payment_id: success ? `pay_mock_${Date.now()}` : 'pay_failed',
        razorpay_order_id: payInfo.razorpayOrderId,
        simulateSuccess: success,
      });
      setProgress(100);
      setDone(success ? 'success' : 'fail');
      if (success) setTimeout(() => onSuccess(res.data.order), 900);
      else setTimeout(() => { setProcessing(false); setDone(null); setErr('Payment failed. Try another method.'); }, 900);
    } catch (e) {
      setProcessing(false); setDone(null); setErr(e.response?.data?.message || 'Verification failed');
    }
  };

  const handlePay = () => {
    if (method === 'upi' && !upiValid) { setErr('Enter a valid UPI ID (e.g. yourname@okaxis)'); return; }
    if (method === 'card' && card.number.replace(/\s/g, '').length < 16) { setErr('Enter a valid 16-digit card number'); return; }
    verify(true);
  };

  const qrData = `upi://pay?pa=pizzaria@razorpay&pn=Pizzaria&am=${rupees}&cu=INR&tn=Order_${String(orderId).slice(-6)}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrData)}`;

  const min = String(Math.floor(qrTick / 60)).padStart(2, '0');
  const sec = String(qrTick % 60).padStart(2, '0');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm anim-fade-up" onClick={(e) => { if (e.target === e.currentTarget && !processing) onClose(); }}>
      <div className="bg-white rounded-[1.5rem] w-full max-w-[860px] max-h-[92vh] overflow-hidden shadow-2xl flex flex-col md:flex-row anim-pop relative">

        {/* Processing overlay */}
        {processing && (
          <div className="absolute inset-0 z-20 bg-white/95 flex flex-col items-center justify-center p-6 text-center">
            {done === 'success' ? (
              <>
                <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center text-white text-3xl shadow-lg shadow-green-500/30 animate-bounce">✓</div>
                <p className="font-extrabold text-lg mt-4 text-green-700">Payment Successful!</p>
                <p className="text-sm text-gray-500">Confirming your order…</p>
              </>
            ) : done === 'fail' ? (
              <>
                <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center text-white text-2xl">✕</div>
                <p className="font-extrabold text-lg mt-4 text-red-600">Payment Failed</p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full border-4 border-orange-100 border-t-red-600 animate-spin" />
                <p className="font-bold mt-4">Processing payment…</p>
                <p className="text-xs text-gray-500">Please do not close this window</p>
                <div className="w-64 h-2 rounded-full bg-orange-100 mt-4 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#FF8A3D,#E0262E)' }} />
                </div>
              </>
            )}
          </div>
        )}

        {/* Left: Order summary */}
        <div className="md:w-[320px] shrink-0 p-6 border-b md:border-b-0 md:border-r border-orange-100 flex flex-col" style={{ background: 'linear-gradient(180deg,#FFF6EC,#FFE9C9)' }}>
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow" style={{ background: 'linear-gradient(135deg,#F22B34,#B3121B)' }}>🍕</span>
            <span className="font-extrabold tracking-tight">Pizzaria</span>
            <span className="ml-auto text-[11px] font-bold bg-white border border-orange-200 rounded-full px-2 py-1">🔒 Secure by Razorpay</span>
          </div>
          <div className="mt-5">
            <div className="text-xs font-bold text-gray-500 tracking-widest">AMOUNT PAYABLE</div>
            <div className="text-3xl font-extrabold">₹{rupees.toFixed(0)}</div>
            <div className="text-xs text-gray-500 font-mono mt-1 break-all">Order: {orderRef}</div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between bg-white/70 rounded-xl px-3 py-2 border border-orange-100"><span className="text-gray-500">Subtotal</span><span className="font-bold">₹{rupees.toFixed(0)}</span></div>
              <div className="flex justify-between px-3 text-xs text-gray-500"><span>Razorpay fee</span><span>₹0 (test mode)</span></div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold text-gray-500">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" /> 256-bit SSL · UPI · Cards · NetBanking · Wallets
            </div>
          </div>
          <div className="mt-auto pt-4 text-[11px] text-gray-400">
            <p>Test mode — no real money is charged. Use any UPI ID (e.g. <b>test@okaxis</b>) or the demo QR.</p>
          </div>
        </div>

        {/* Right: Payment methods */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Method tabs */}
          <div className="flex gap-1.5 p-3 border-b border-orange-100 overflow-x-auto">
            {[
              ['upi', 'UPI', '⚡'],
              ['qr', 'UPI QR', '◧'],
              ['card', 'Card', '💳'],
              ['netbanking', 'NetBanking', '🏦'],
              ['wallet', 'Wallet', '👛'],
            ].map(([k, label, icon]) => (
              <button key={k} onClick={() => setMethod(k)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-extrabold border transition-all whitespace-nowrap ${method === k ? 'text-white border-red-600 shadow-md' : 'bg-orange-50 border-orange-100 text-gray-600 hover:bg-white'}`}
                style={method === k ? { background: 'linear-gradient(135deg,#F22B34,#B3121B)' } : undefined}>
                <span className="mr-1">{icon}</span>{label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {method === 'upi' && (
              <div className="space-y-4 anim-fade-up">
                <div>
                  <label className="text-xs font-bold text-gray-600">UPI ID</label>
                  <div className="flex gap-2 mt-1.5">
                    <input value={upi} onChange={(e) => setUpi(e.target.value)} placeholder="yourname@okaxis" className="input !mt-0 flex-1" />
                    <button onClick={handlePay} className="btn btn-primary whitespace-nowrap">Pay ₹{rupees.toFixed(0)}</button>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">We’ll send a collect request to your UPI app</p>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    ['GPay', '🔵'], ['PhonePe', '💜'], ['Paytm', '🔷'], ['BHIM', '🟧'],
                  ].map(([name, dot]) => (
                    <button key={name} onClick={() => { setUpi(`test@${name.toLowerCase()}`); setTimeout(() => verify(true), 300); }}
                      className="rounded-2xl border border-orange-100 bg-white p-3 flex flex-col items-center gap-1 hover:shadow-md hover:-translate-y-0.5 transition-all">
                      <span className="text-xl">{dot}</span><span className="text-[11px] font-bold">{name}</span>
                    </button>
                  ))}
                </div>
                <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 text-xs flex gap-2">
                  <span>💡</span><span><b>Demo:</b> type <span className="font-mono bg-white px-1 rounded">test@okaxis</span> and hit Pay — no real UPI needed.</span>
                </div>
              </div>
            )}

            {method === 'qr' && (
              <div className="text-center space-y-3 anim-fade-up">
                <p className="text-sm font-bold">Scan with any UPI app 📱</p>
                <div className="w-[200px] h-[200px] mx-auto rounded-2xl border-2 border-dashed border-orange-200 p-2 bg-white shadow-inner">
                  <img src={qrSrc} alt="Demo UPI QR" className="w-full h-full object-contain rounded-xl" />
                </div>
                <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-3 py-1.5 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Expires in {min}:{sec} · ₹{rupees.toFixed(0)}
                </div>
                <p className="text-[11px] text-gray-400 max-w-xs mx-auto">Demo QR — encodes <span className="font-mono">upi://pay?pa=pizzaria@razorpay…</span>. Click <b>Simulate Success</b> below — no real scan needed.</p>
                <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
                  <button onClick={() => verify(true)} className="btn btn-primary">Simulate Success</button>
                  <button onClick={() => verify(false)} className="btn btn-secondary">Simulate Failure</button>
                </div>
              </div>
            )}

            {method === 'card' && (
              <div className="space-y-3 anim-fade-up">
                <input placeholder="Card number — 4111 1111 1111 1111" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} className="input" maxLength={19} />
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="MM / YY" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} className="input" />
                  <input placeholder="CVV" value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} className="input" type="password" maxLength={4} />
                </div>
                <input placeholder="Cardholder name" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} className="input" />
                <button onClick={handlePay} className="btn btn-primary w-full">Pay ₹{rupees.toFixed(0)}</button>
                <p className="text-[11px] text-gray-400 text-center">Test card: <span className="font-mono">4111 1111 1111 1111</span> — any future date & CVV</p>
              </div>
            )}

            {method === 'netbanking' && (
              <div className="space-y-3 anim-fade-up">
                <p className="text-xs font-bold text-gray-600">Select your bank</p>
                <div className="grid grid-cols-2 gap-2">
                  {['HDFC', 'ICICI', 'SBI', 'Axis', 'Kotak', 'Yes Bank'].map((b) => (
                    <button key={b} onClick={() => setBank(b)} className={`rounded-xl border p-3 text-sm font-bold transition ${bank === b ? 'bg-red-50 border-red-300 text-red-700' : 'bg-white border-orange-100 hover:bg-orange-50'}`}>{b}</button>
                  ))}
                </div>
                <button onClick={() => verify(true)} className="btn btn-primary w-full">Pay via {bank} — ₹{rupees.toFixed(0)}</button>
              </div>
            )}

            {method === 'wallet' && (
              <div className="space-y-3 anim-fade-up">
                <div className="grid grid-cols-3 gap-2">
                  {['Paytm', 'PhonePe', 'Amazon Pay'].map((w) => (
                    <button key={w} onClick={() => setWallet(w)} className={`rounded-xl border p-3 text-xs font-bold ${wallet === w ? 'bg-red-50 border-red-300 text-red-700' : 'bg-white border-orange-100'}`}>{w}</button>
                  ))}
                </div>
                <button onClick={() => verify(true)} className="btn btn-primary w-full">Pay with {wallet} — ₹{rupees.toFixed(0)}</button>
              </div>
            )}

            {err && <p className="text-sm text-red-600 font-semibold bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</p>}
            <div className="flex justify-between items-center pt-2 border-t border-orange-100">
              <button onClick={onClose} disabled={processing} className="text-sm font-bold text-gray-500 hover:text-red-600 disabled:opacity-40">Cancel</button>
              <span className="text-[11px] text-gray-400">Powered by <b>Razorpay</b> · Test Mode</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
