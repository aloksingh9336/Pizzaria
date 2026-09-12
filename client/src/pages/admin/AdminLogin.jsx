import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AuthContext';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const { adminLogin } = useAdmin();
  const nav = useNavigate();
  const submit = async (e) => {
    e.preventDefault(); setErr('');
    try { await adminLogin(form.email, form.password); nav('/admin/inventory'); }
    catch (e) { setErr(e.response?.data?.message || 'Login failed'); }
  };
  return (
    <div className="max-w-md mx-auto card mt-8 p-6">
      <h2 className="text-xl font-bold">Admin login</h2>
      <p className="text-xs text-gray-500">Separate route, no public registration. Seed via <code>npm run seed</code>.</p>
      <form onSubmit={submit} className="mt-3 space-y-3">
        <input className="input" type="email" placeholder="Admin email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button className="btn btn-primary w-full">Login as admin</button>
      </form>
      {err && <p className="text-red-600 text-sm mt-2">{err}</p>}
    </div>
  );
}
