// Offline-safe SVG pizza artwork in the app's red/cream theme.
// Variants: "whole" | "slice" — recolored per category via `tone`.
const TONES = {
  classic: { cheese: '#FFC93C', sauce: '#E0262E', crust: '#E8A94F', crustDark: '#C97F2B' },
  veggie: { cheese: '#FFD968', sauce: '#2E9E44', crust: '#E8A94F', crustDark: '#C97F2B' },
  bbq: { cheese: '#F5A623', sauce: '#7A3B12', crust: '#D99A45', crustDark: '#A96A22' },
  cheese: { cheese: '#FFE08A', sauce: '#F2B705', crust: '#E8A94F', crustDark: '#C97F2B' },
};

function Toppings({ t, cx = 100, cy = 100, r = 52 }) {
  // Deterministic pseudo-random topping placement from tone key
  let seed = [...t.cheese].reduce((a, c) => a + c.charCodeAt(0), 0);
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  const items = [];
  for (let i = 0; i < 9; i++) {
    const ang = rnd() * Math.PI * 2;
    const dist = rnd() * (r - 14);
    const x = cx + Math.cos(ang) * dist;
    const y = cy + Math.sin(ang) * dist;
    const kind = i % 3;
    if (kind === 0) items.push(<circle key={i} cx={x} cy={y} r="6.5" fill="#B3121B" stroke="#7d0d13" strokeWidth="1.5" />);
    else if (kind === 1) items.push(<circle key={i} cx={x} cy={y} r="4.5" fill="#2E9E44" />);
    else items.push(<ellipse key={i} cx={x} cy={y} rx="6" ry="4" fill="#fff" opacity="0.85" transform={`rotate(${ang * 57} ${x} ${y})`} />);
  }
  return <g>{items}</g>;
}

export function PizzaWhole({ tone = 'classic', size = 200, className = '', spin = false }) {
  const t = TONES[tone] || TONES.classic;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" className={`${spin ? 'anim-spin-slow' : ''} ${className}`}>
      <ellipse cx="100" cy="172" rx="62" ry="10" fill="rgba(0,0,0,0.15)" />
      <circle cx="100" cy="100" r="78" fill={t.crustDark} />
      <circle cx="100" cy="96" r="78" fill={t.crust} />
      <circle cx="100" cy="96" r="64" fill={t.sauce} />
      <circle cx="100" cy="96" r="58" fill={t.cheese} />
      {/* cheese shine */}
      <path d="M55 75 Q80 55 115 60" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.5" fill="none" />
      <Toppings t={t} cy={96} />
    </svg>
  );
}

export function PizzaSlice({ size = 96, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <ellipse cx="50" cy="90" rx="30" ry="5" fill="rgba(0,0,0,0.12)" />
      <path d="M50 8 L14 78 Q50 96 86 78 Z" fill="#E8A94F" />
      <path d="M50 16 L22 74 Q50 87 78 74 Z" fill="#E0262E" />
      <path d="M50 22 L28 70 Q50 80 72 70 Z" fill="#FFC93C" />
      <circle cx="46" cy="48" r="5" fill="#B3121B" />
      <circle cx="58" cy="60" r="5" fill="#B3121B" />
      <circle cx="50" cy="66" r="3.5" fill="#2E9E44" />
      {/* cheese drip */}
      <g style={{ transformOrigin: '50px 75px', animation: 'cheeseDrip 2.4s ease-in-out infinite' }}>
        <rect x="44" y="72" width="5" height="12" rx="2.5" fill="#FFC93C" />
        <rect x="58" y="70" width="4" height="9" rx="2" fill="#FFC93C" />
      </g>
    </svg>
  );
}

export function OfferBadge({ text = '30% OFF', size = 92 }) {
  return (
    <div className="relative flex items-center justify-center rounded-full text-white font-extrabold text-center leading-tight shadow-xl"
      style={{ width: size, height: size, background: 'radial-gradient(circle at 35% 30%, #F22B34, #B3121B)', fontSize: size * 0.2 }}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 anim-spin-slow" style={{ animationDuration: '18s' }}>
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i * 15 * Math.PI) / 180;
          return <circle key={i} cx={50 + 46 * Math.cos(a)} cy={50 + 46 * Math.sin(a)} r="2.4" fill="#FFD968" />;
        })}
      </svg>
      <span className="px-2">{text}</span>
    </div>
  );
}
