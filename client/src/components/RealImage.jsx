import { useState } from 'react';
import { PizzaWhole, PizzaSlice } from './PizzaArt';

// Renders a real <img> with graceful fallback to SVG pizza art if the URL fails.
export function RealImage({ src, alt, fallbackTone = 'classic', variant = 'whole', className = '', imgClassName = '', size = 170 }) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    return variant === 'slice'
      ? <PizzaSlice size={size} className={className} />
      : <PizzaWhole tone={fallbackTone} size={size} className={className} />;
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`${imgClassName} ${className}`}
    />
  );
}

export function RealPizzaThumb({ src, alt, tone = 'classic', size = 78 }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-orange-50 border border-orange-100 shrink-0" style={{ width: size, height: size }}>
      <RealImage
        src={src}
        alt={alt}
        fallbackTone={tone}
        size={size}
        imgClassName="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
      />
    </div>
  );
}
