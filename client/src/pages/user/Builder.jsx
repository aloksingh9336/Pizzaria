import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { endpoints } from '../../services/api';

const STEPS = ['base', 'sauce', 'cheese', 'vegetable'];
const LABELS = { base: 'Choose Base', sauce: 'Choose Sauce', cheese: 'Choose Cheese', vegetable: 'Pick Vegetables (multi)' };
const BASE_PRICE = 0;

export default function Builder() {
  const [options, setOptions] = useState(null);
  const [step, setStep] = useState(0);
  const [sel, setSel] = useState({ base: null, sauce: null, cheese: null, vegetable: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const nav = useNavigate();

  useEffect(() => {
    endpoints.pizzaOptions().then((r) => setOptions(r.data.options)).catch((e) => setError('Failed to load options')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading builder...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  const cat = STEPS[step];
  const items = options[cat] || [];
  const price = (sel.base?.priceModifier || 0) + (sel.sauce?.priceModifier || 0) + (sel.cheese?.priceModifier || 0) + sel.vegetable.reduce((a, v) => a + v.priceModifier, 0);

  const pick = (item) => {
    if (!item.available) return;
    if (cat === 'vegetable') {
      setSel((s) => ({
        ...s,
        vegetable: s.vegetable.find((v) => v.name === item.name)
          ? s.vegetable.filter((v) => v.name !== item.name)
          : [...s.vegetable, item],
      }));
    } else {
      setSel((s) => ({ ...s, [cat]: item }));
    }
  };

  const canNext = cat === 'vegetable' ? true : !!sel[cat];

  const next = () => {
    if (step < 3) setStep(step + 1);
    else {
      // go to summary: persist draft
      const pizza = { base: sel.base.name, sauce: sel.sauce.name, cheese: sel.cheese.name, vegetables: sel.vegetable.map((v) => v.name), price: price || BASE_PRICE };
      sessionStorage.setItem('pizzaDraft', JSON.stringify({ items: [pizza], totalAmount: pizza.price }));
      nav('/summary');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold">Custom Pizza Builder</h2>
      <div className="flex gap-2 mt-4">
        {STEPS.map((s, i) => (
          <div key={s} className={`flex-1 text-center text-xs font-bold py-2 rounded ${i === step ? 'bg-red-600 text-white' : i < step ? 'bg-green-200' : 'bg-gray-200'}`}>
            {i + 1}. {s}
          </div>
        ))}
      </div>
      <div className="card mt-4">
        <h3 className="font-bold">{LABELS[cat]}</h3>
        <div className="grid gap-2 mt-3">
          {items.map((it) => {
            const active = cat === 'vegetable' ? sel.vegetable.some((v) => v.name === it.name) : sel[cat]?.name === it.name;
            return (
              <button key={it.name} disabled={!it.available} onClick={() => pick(it)}
                className={`text-left border rounded p-3 flex justify-between ${active ? 'border-red-600 bg-red-50' : ''} ${!it.available ? 'opacity-40' : ''}`}>
                <span>{it.name} {!it.available && '(out of stock)'}</span>
                <span className="font-bold">+₹{it.priceModifier}</span>
              </button>
            );
          })}
        </div>
        <div className="flex justify-between items-center mt-4">
          <button className="btn btn-secondary" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</button>
          <span className="font-bold">Total: ₹{price}</span>
          <button className="btn btn-primary" disabled={!canNext} onClick={next}>{step === 3 ? 'Review Order →' : 'Next →'}</button>
        </div>
      </div>
    </div>
  );
}
