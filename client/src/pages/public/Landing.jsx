import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { endpoints } from '../../services/api';
import { OfferBadge } from '../../components/PizzaArt';
import { RealImage } from '../../components/RealImage';
import { IMAGE_MAP, getImage } from '../../data/images';

const CATEGORIES = [
  { key: 'base', label: 'Bases', icon: '🍞' },
  { key: 'sauce', label: 'Sauces', icon: '🥫' },
  { key: 'cheese', label: 'Cheeses', icon: '🧀' },
  { key: 'vegetable', label: 'Veggies', icon: '🫑' },
];

// Chef-curated specials assembled from live pizza options
const SPECIALS = [
  { name: 'Supreme Pan Pizza', desc: 'Loaded with veggies, olives, mushrooms & more', badge: 'BESTSELLER', rating: '4.8 (12.5K+)', tone: 'classic', img: IMAGE_MAP['_special_supreme'], pick: { base: 'Thick Crust', sauce: 'Tomato Basil', cheese: 'Mozzarella', vegetables: ['Capsicum', 'Onion', 'Mushroom', 'Olives'] } },
  { name: 'Cheese Lovers Pizza', desc: 'Extra cheese, extra delight for true cheese lovers', badge: 'POPULAR', rating: '4.7 (8.7K+)', tone: 'cheese', img: IMAGE_MAP['_special_cheese'], pick: { base: 'Cheese Burst', sauce: 'Alfredo', cheese: 'Cheddar', vegetables: ['Onion'] } },
  { name: 'BBQ Garden Pizza', desc: 'Smoky BBQ with crunchy garden veggies', badge: 'NEW', rating: '4.6 (6.3K+)', tone: 'bbq', img: IMAGE_MAP['_special_bbq'], pick: { base: 'Thin Crust', sauce: 'BBQ', cheese: 'Mozzarella', vegetables: ['Capsicum', 'Jalapeno', 'Onion'] } },
];

const priceOf = (options, cat, name) =>
  options?.[cat]?.find((o) => o.name.toLowerCase() === name.toLowerCase())?.priceModifier ?? 0;

export default function Landing() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cat, setCat] = useState('base');
  const nav = useNavigate();

  useEffect(() => {
    endpoints.pizzaOptions().then((r) => setData(r.data.options)).catch((e) => setError(e.response?.data?.message || 'Failed to load')).finally(() => setLoading(false));
  }, []);

  const specials = useMemo(() => {
    if (!data) return [];
    return SPECIALS.map((s) => {
      const items = [
        { cat: 'base', name: s.pick.base }, { cat: 'sauce', name: s.pick.sauce },
        { cat: 'cheese', name: s.pick.cheese }, ...s.pick.vegetables.map((v) => ({ cat: 'vegetable', name: v })),
      ];
      const price = items.reduce((a, it) => a + priceOf(data, it.cat, it.name), 0);
      const available = items.every((it) => {
        const opt = data[it.cat]?.find((o) => o.name.toLowerCase() === it.name.toLowerCase());
        return opt && opt.available;
      });
      return { ...s, price, available };
    });
  }, [data]);

  const orderSpecial = (s) => {
    sessionStorage.setItem('pizzaDraft', JSON.stringify({
      items: [{ base: s.pick.base, sauce: s.pick.sauce, cheese: s.pick.cheese, vegetables: s.pick.vegetables, price: s.price }],
      totalAmount: s.price,
    }));
    nav('/summary');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-16">
      {/* HERO */}
      <div className="anim-fade-up mt-5 rounded-[2rem] overflow-hidden text-white relative shadow-2xl shadow-red-900/30"
        style={{ background: 'linear-gradient(120deg,#1c0f0a 30%,#5c1414 70%,#8f1d1d)' }}>
        <div className="hero-texture absolute inset-0" />
        <div className="relative grid md:grid-cols-2 items-center p-7 sm:p-10 gap-6">
          <div>
            <span className="badge bg-red-600 text-white tracking-widest anim-pop">LIMITED TIME OFFER</span>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-[1.05] mt-3">
              MORE CHEESE.<br /><span className="text-red-500">MORE HAPPINESS.</span>
            </h1>
            <p className="text-orange-100/80 mt-3 max-w-sm">Hot, cheesy and baked with love, just for you. Build your own or grab a chef's special.</p>
            <div className="flex gap-3 mt-5">
              <Link to="/builder" className="btn btn-primary">Order Now <span aria-hidden>→</span></Link>
              <a href="#popular" className="btn btn-secondary !bg-white/10 !text-white !border-white/20 hover:!bg-white/20">Popular Picks</a>
            </div>
            <div className="flex gap-5 mt-5 text-xs text-orange-100/70 font-semibold">
              <span>⚡ 30–40 min delivery</span><span>⭐ 4.8 rated</span><span>🛵 Free delivery over ₹499</span>
            </div>
          </div>
          <div className="flex justify-center relative">
            <div className="absolute w-64 h-64 rounded-full bg-red-600/40 blur-3xl" />
            <div className="anim-float relative rounded-[2rem] overflow-hidden shadow-2xl max-w-[320px] aspect-square">
              <RealImage src={IMAGE_MAP['_hero']} alt="Cheesy pizza hero" fallbackTone="classic" size={320} imgClassName="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-1 right-4 sm:right-10 anim-pop d3"><OfferBadge text="30% OFF" /></div>
          </div>
        </div>
      </div>

      {/* MARQUEE */}
      <div className="anim-fade-up d1 mt-5 overflow-hidden rounded-full bg-[#2B2118] text-amber-100 text-sm font-bold py-2.5 shadow">
        <div className="marquee-track gap-8 px-4">
          {[0, 1].map((k) => (
            <span key={k} className="flex gap-8 whitespace-nowrap">
              <span>🍕 MORE CHEESE</span><span>✨ MORE HAPPINESS</span><span>🛵 FREE DELIVERY OVER ₹499</span><span>🔥 FRESH FROM THE OVEN</span><span>🧀 CHEESE BURST IS BACK</span>
            </span>
          ))}
        </div>
      </div>

      {/* CATEGORIES */}
      <div className="anim-fade-up d2 mt-8">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {CATEGORIES.map((c) => (
            <button key={c.key} onClick={() => setCat(c.key)}
              className={`flex flex-col items-center min-w-[92px] px-4 py-3 rounded-3xl border transition-all duration-200 ${cat === c.key ? 'bg-white border-red-500 shadow-lg shadow-red-600/15 -translate-y-1' : 'bg-white/60 border-orange-100 hover:bg-white'}`}>
              <span className="text-3xl">{c.icon}</span>
              <span className={`text-xs font-bold mt-1 ${cat === c.key ? 'text-red-600' : 'text-gray-600'}`}>{c.label}</span>
            </button>
          ))}
          <button onClick={() => nav('/builder')} className="flex flex-col items-center min-w-[92px] px-4 py-3 rounded-3xl text-white shadow-lg shadow-red-600/30 hover:-translate-y-1 transition-all" style={{ background: 'linear-gradient(135deg,#F22B34,#B3121B)' }}>
            <span className="text-3xl">🧙</span><span className="text-xs font-bold mt-1">Builder</span>
          </button>
        </div>

        {/* category items */}
        {loading && <p className="mt-4 text-sm text-gray-500">Loading fresh options...</p>}
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        {data && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-4">
            {(data[cat] || []).map((i, idx) => (
              <div key={i._id || i.name} className={`card card-hover !p-3 text-center anim-fade-up overflow-hidden ${!i.available ? 'opacity-60 grayscale' : ''}`} style={{ animationDelay: `${idx * 0.06}s` }}>
                <div className="rounded-2xl overflow-hidden aspect-square bg-orange-50 border border-orange-100">
                  <RealImage src={getImage(i.name)} alt={i.name} fallbackTone={cat === 'vegetable' ? 'veggie' : cat === 'sauce' ? 'bbq' : 'classic'} variant="slice" size={96} imgClassName="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="font-bold text-sm mt-2">{i.name}</div>
                <div className="text-red-600 font-extrabold text-sm">+₹{i.priceModifier}</div>
                <div className={`text-[11px] font-bold mt-1 ${i.available ? 'text-green-600' : 'text-red-500'}`}>{i.available ? `● In stock (${i.stock ?? '–'})` : '🚫 Out of stock'}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* POPULAR PICKS */}
      <div id="popular" className="mt-10 anim-fade-up d3">
        <div className="flex justify-between items-center">
          <h2 className="section-title">Popular Picks 🔥</h2>
          <Link to="/builder" className="text-sm font-bold text-red-600 hover:underline">View All →</Link>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {specials.map((s, idx) => (
            <div key={s.name} className="card card-hover overflow-hidden !p-0 anim-fade-up" style={{ animationDelay: `${idx * 0.12}s` }}>
              <div className="relative h-48 overflow-hidden" style={{ background: 'radial-gradient(circle at 50% 120%, #FFE9C9, #FFF6EC)' }}>
                <RealImage src={s.img} alt={s.name} fallbackTone={s.tone} size={240} imgClassName="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                <span className="badge absolute top-3 left-3 text-white shadow" style={{ background: s.badge === 'NEW' ? '#E0262E' : s.badge === 'POPULAR' ? '#FF6B00' : '#B3121B' }}>{s.badge}</span>
                <span className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:scale-110 transition cursor-pointer">🤍</span>
              </div>
              <div className="p-4">
                <h3 className="font-extrabold">{s.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5 min-h-[2rem]">{s.desc}</p>
                <div className="text-xs font-semibold text-gray-600 mt-1">⭐ {s.rating}</div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-lg font-extrabold">₹{s.price}</span>
                  <button disabled={!s.available} onClick={() => orderSpecial(s)}
                    className={`w-10 h-10 rounded-full text-white text-xl font-bold shadow-lg transition-all hover:scale-110 active:scale-95 ${s.available ? 'shadow-red-600/40' : 'grayscale opacity-40'}`}
                    style={{ background: 'linear-gradient(135deg,#F22B34,#B3121B)' }} title={s.available ? 'Order this pizza' : 'Out of stock'}>
                    {s.available ? '+' : '×'}
                  </button>
                </div>
                {!s.available && <p className="text-[11px] text-red-500 font-bold mt-1">An ingredient is out of stock</p>}
              </div>
            </div>
          ))}
          {!data && !loading && <p className="text-sm text-gray-500">Start the backend to see live specials.</p>}
        </div>
      </div>

      {/* COMBO BANNER */}
      <div className="anim-fade-up d4 mt-10 rounded-[2rem] p-7 sm:p-8 flex flex-col md:flex-row items-center gap-6 text-white relative overflow-hidden shadow-xl shadow-orange-900/20"
        style={{ background: 'linear-gradient(120deg,#FF8A3D,#E0262E 70%)' }}>
        <div className="hero-texture absolute inset-0" />
        <div className="relative flex-1">
          <div className="text-xs font-extrabold tracking-widest text-amber-100">EXCLUSIVE COMBOS</div>
          <h3 className="text-3xl font-extrabold">UP TO 30% OFF <span className="block text-base font-semibold text-orange-100">On selected combos</span></h3>
          <Link to="/builder" className="btn mt-4 inline-block bg-white text-red-600 font-extrabold shadow hover:-translate-y-0.5">Order Now →</Link>
        </div>
        <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-3xl overflow-hidden shadow-2xl anim-float shrink-0">
          <RealImage src={IMAGE_MAP['_combo']} alt="Combo pizza" fallbackTone="veggie" size={200} imgClassName="w-full h-full object-cover" />
        </div>
        <div className="relative anim-pop d5"><OfferBadge text="30% OFF" size={104} /></div>
      </div>

      {/* TRUST STRIP */}
      <div className="anim-fade-up d5 mt-8 card !p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs font-bold text-gray-700">
        {[['🛵', 'Fast Delivery', '30–40 mins'], ['🏅', 'Best Quality', 'Always Fresh'], ['🎟️', 'Exciting Offers', 'Everyday'], ['🛡️', 'Safe & Secure', 'Payments']].map(([icon, a, b]) => (
          <div key={a} className="flex flex-col items-center gap-1 py-2 hover:-translate-y-0.5 transition-transform">
            <span className="text-2xl">{icon}</span><span>{a}<span className="block font-medium text-gray-400">{b}</span></span>
          </div>
        ))}
      </div>
    </div>
  );
}
