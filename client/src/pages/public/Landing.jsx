import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { endpoints } from '../../services/api';

export default function Landing() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    endpoints.pizzaOptions().then((r) => setData(r.data.options)).catch((e) => setError(e.response?.data?.message || 'Failed to load')).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="text-center py-10">
        <h1 className="text-4xl font-extrabold">Build your dream pizza 🍕</h1>
        <p className="mt-2 text-gray-600">Live stock-based availability · 4-step builder · Razorpay test checkout · Real-time tracking</p>
        <Link to="/builder" className="btn btn-primary inline-block mt-5">Start Building</Link>
      </div>
      {loading && <p>Loading varieties...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {data && (
        <div className="grid md:grid-cols-4 gap-4">
          {Object.entries(data).map(([cat, items]) => (
            <div key={cat} className="card">
              <h3 className="font-bold capitalize mb-2">{cat}</h3>
              {items.map((i) => (
                <div key={i._id} className="flex justify-between text-sm py-1 border-b">
                  <span>{i.name} {i.available ? '' : '🚫'}</span>
                  <span className="font-semibold">₹{i.priceModifier}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
