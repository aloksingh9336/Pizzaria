import { useEffect, useState } from 'react';
import { endpoints } from '../../services/api';

export default function AdminInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [edits, setEdits] = useState({});

  const load = () => {
    endpoints.adminInventory().then((r) => setItems(r.data.items)).catch((e) => setErr(e.response?.data?.message || 'Failed')).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const save = async (id) => {
    const e = edits[id];
    if (!e) return;
    const payload = {};
    if (e.stockQuantity !== '' && e.stockQuantity !== undefined) payload.stockQuantity = Number(e.stockQuantity);
    if (e.lowStockThreshold !== '' && e.lowStockThreshold !== undefined) payload.lowStockThreshold = Number(e.lowStockThreshold);
    try {
      const r = await endpoints.adminPatchInventory(id, payload);
      setItems((prev) => prev.map((i) => (i._id === id ? r.data.item : i)));
      setEdits((p) => ({ ...p, [id]: {} }));
    } catch (e) { alert(e.response?.data?.message || 'Save failed'); }
  };

  if (loading) return <div className="p-8">Loading inventory...</div>;
  if (err) return <div className="p-8 text-red-600">{err}</div>;

  const groups = ['base', 'sauce', 'cheese', 'vegetable'];
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold">Inventory Dashboard</h2>
      <p className="text-sm text-gray-500">Low-stock rows highlighted · inline edit stock + threshold</p>
      {groups.map((g) => (
        <div key={g} className="mt-5">
          <h3 className="font-bold capitalize">{g}s</h3>
          <div className="card mt-2 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left border-b"><th>Name</th><th>Stock</th><th>Threshold</th><th>Unit</th><th>Edit</th><th></th></tr></thead>
              <tbody>
                {items.filter((i) => i.type === g).map((i) => {
                  const low = i.stockQuantity < i.lowStockThreshold;
                  return (
                    <tr key={i._id} className={`border-b ${low ? 'bg-red-50' : ''}`}>
                      <td className="py-2 font-semibold">{i.name} {low && '⚠️ LOW'}</td>
                      <td>{i.stockQuantity}</td>
                      <td>{i.lowStockThreshold}</td>
                      <td>{i.unit}</td>
                      <td>
                        <input className="border rounded px-1 w-16" placeholder="stock" type="number"
                          value={edits[i._id]?.stockQuantity ?? ''} onChange={(e) => setEdits({ ...edits, [i._id]: { ...edits[i._id], stockQuantity: e.target.value } })} />
                        <input className="border rounded px-1 w-16 ml-1" placeholder="thresh" type="number"
                          value={edits[i._id]?.lowStockThreshold ?? ''} onChange={(e) => setEdits({ ...edits, [i._id]: { ...edits[i._id], lowStockThreshold: e.target.value } })} />
                      </td>
                      <td><button className="btn btn-primary text-xs px-2 py-1" onClick={() => save(i._id)}>Save</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
