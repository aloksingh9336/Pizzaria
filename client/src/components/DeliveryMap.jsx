import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon paths (Vite)
delete L.Icon.Default.prototype._getIconUrl;

// Demo coordinates — Connaught Place area (store → nearby customer ~1.2km)
const STORE = [28.6139, 77.2090];
const CUSTOMER = [28.6205, 77.2185];

function lerp(a, b, t) { return a + (b - a) * t; }
function routePoints(t) {
  // Curved route with a mid bend for realism
  const mid = [lerp(STORE[0], CUSTOMER[0], 0.5) + 0.002, lerp(STORE[1], CUSTOMER[1], 0.5) - 0.001];
  const pts = [];
  const segs = 40;
  for (let i = 0; i <= segs; i++) {
    const f = i / segs;
    // quadratic bezier STORE → mid → CUSTOMER
    const x = (1 - f) * (1 - f) * STORE[0] + 2 * (1 - f) * f * mid[0] + f * f * CUSTOMER[0];
    const y = (1 - f) * (1 - f) * STORE[1] + 2 * (1 - f) * f * mid[1] + f * f * CUSTOMER[1];
    pts.push([x, y]);
  }
  // slice up to progress t
  const n = Math.max(1, Math.round(pts.length * Math.min(1, Math.max(0, t))));
  return pts.slice(0, n);
}

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points?.length) return;
    map.fitBounds(L.latLngBounds([STORE, CUSTOMER]), { padding: [24, 24] });
  }, [map]);
  return null;
}

function iconHtml(emoji, bg) {
  return L.divIcon({
    html: `<div style="width:36px;height:36px;border-radius:9999px;display:flex;align-items:center;justify-content:center;font-size:18px;background:${bg};border:3px solid white;box-shadow:0 6px 18px rgba(0,0,0,0.25)">${emoji}</div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}
const storeIcon = iconHtml('🏪', 'white');
const customerIcon = iconHtml('📍', '#E0262E');
function riderIcon(heading) {
  return L.divIcon({
    html: `<div style="width:44px;height:44px;border-radius:9999px;display:flex;align-items:center;justify-content:center;font-size:22px;background:linear-gradient(135deg,#F22B34,#B3121B);border:3px solid white;box-shadow:0 8px 22px rgba(224,38,46,0.45);transform:rotate(${heading}deg)">🛵</div>`,
    className: '',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

const PARTNERS = [
  { name: 'Ravi Kumar', phone: '+91 98XXX X3210', rating: '4.9 ★', trips: '2.4k deliveries', avatar: 'https://i.pravatar.cc/100?img=15', vehicle: 'Splendor • DL 3S AB 1234' },
  { name: 'Aman Singh', phone: '+91 98XXX X6784', rating: '4.8 ★', trips: '1.9k deliveries', avatar: 'https://i.pravatar.cc/100?img=12', vehicle: 'Activa • DL 8C XY 5678' },
];

export default function DeliveryMap({ status, onSimulate }) {
  const partner = useMemo(() => PARTNERS[Math.floor(Math.random() * PARTNERS.length)], []);
  const isEnRoute = status === 'Sent to Delivery';
  const isDelivered = status === 'Delivered';
  const [progress, setProgress] = useState(isDelivered ? 1 : isEnRoute ? 0.12 : 0);
  const [eta, setEta] = useState(14);
  const trail = useMemo(() => routePoints(progress), [progress]);
  const fullRoute = useMemo(() => routePoints(1), []);
  const riderPos = trail[trail.length - 1] || STORE;
  const heading = useMemo(() => {
    if (trail.length < 2) return -30;
    const a = trail[trail.length - 2], b = trail[trail.length - 1];
    return Math.atan2(b[1] - a[1], b[0] - a[0]) * 57;
  }, [trail]);

  // Animate rider when en route (demo: 90s from 0→100%)
  useEffect(() => {
    if (!isEnRoute || isDelivered) { if (isDelivered) setProgress(1); return; }
    const start = Date.now();
    const dur = 90_000; // 90s demo ride
    const base = progress;
    const tick = () => {
      const elapsed = Date.now() - start;
      const f = Math.min(1, elapsed / dur);
      setProgress(base + (1 - base) * f);
      const remain = Math.max(0, Math.ceil((1 - (base + (1 - base) * f)) * 14));
      setEta(remain);
    };
    const id = setInterval(tick, 400);
    return () => clearInterval(id);
  }, [isEnRoute, isDelivered]);

  // Reset when status jumps back
  useEffect(() => {
    if (status === 'Order Received' || status === 'In Kitchen') { setProgress(0); setEta(14); }
    if (status === 'Delivered') { setProgress(1); setEta(0); }
  }, [status]);

  const kmLeft = ((1 - progress) * 1.2).toFixed(1);

  return (
    <div className="space-y-3">
      {/* Map */}
      <div className="rounded-[1.5rem] overflow-hidden border border-orange-100 shadow-xl shadow-orange-900/10 anim-fade-up" style={{ height: 360 }}>
        <MapContainer center={STORE} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false} attributionControl={true}>
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds points={fullRoute} />
          {/* full faded route */}
          <Polyline positions={fullRoute} pathOptions={{ color: '#FFC9A0', weight: 10, opacity: 0.9 }} />
          {/* travelled */}
          <Polyline positions={trail} pathOptions={{ color: '#E0262E', weight: 6, opacity: 1 }} />
          <Marker position={STORE} icon={storeIcon} />
          <Marker position={CUSTOMER} icon={customerIcon} />
          <Marker position={riderPos} icon={riderIcon(heading)} />
        </MapContainer>
      </div>

      {/* ETA strip */}
      <div className="card !p-3 flex flex-wrap items-center gap-3 justify-between anim-fade-up d1">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-full flex items-center justify-center text-white font-extrabold" style={{ background: isDelivered ? '#16a34a' : 'linear-gradient(135deg,#F22B34,#B3121B)' }}>{isDelivered ? '✓' : '🛵'}</span>
          <div>
            <div className="text-sm font-extrabold">{isDelivered ? 'Delivered!' : isEnRoute ? `${eta} min away` : status}</div>
            <div className="text-xs text-gray-500">{isDelivered ? 'Enjoy your pizza 🍕' : `${kmLeft} km left · Live demo tracking`}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onSimulate} className="btn btn-secondary text-xs !py-1.5">↻ Simulate next status</button>
          <a href={`https://www.openstreetmap.org/directions?from=${STORE.join(',')}&to=${CUSTOMER.join(',')}`} target="_blank" rel="noreferrer" className="btn btn-primary text-xs !py-1.5">Open in Maps</a>
        </div>
      </div>

      {/* Partner card */}
      <div className="card !p-4 flex gap-3 items-center anim-fade-up d2">
        <img src={partner.avatar} alt={partner.name} className="w-14 h-14 rounded-full object-cover border-2 border-orange-100" />
        <div className="flex-1 min-w-0">
          <div className="font-extrabold text-sm flex items-center gap-2">{partner.name} <span className="badge bg-green-100 text-green-700">{partner.rating}</span><span className="live-dot w-2 h-2 rounded-full bg-green-500 inline-block ml-1" /></div>
          <div className="text-xs text-gray-500 truncate">{partner.vehicle} · {partner.trips}</div>
          <div className="text-xs font-bold text-gray-600">{partner.phone}</div>
        </div>
        <div className="flex gap-2">
          <a href={`tel:${partner.phone.replace(/\s/g, '')}`} className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center shadow hover:scale-105 transition">📞</a>
          <button onClick={() => alert('Demo: message to rider — no real SMS in test mode')} className="w-10 h-10 rounded-full bg-white border border-orange-200 flex items-center justify-center hover:bg-orange-50 transition">💬</button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-3 text-[11px] font-bold text-gray-500 justify-center">
        <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full bg-red-600 inline-block" /> Travelled</span>
        <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full bg-orange-200 inline-block" /> Route</span>
        <span>🏪 Store → 🛵 Rider → 📍 You</span>
      </div>
    </div>
  );
}
