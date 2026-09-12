import { useState } from 'react';
import { Link } from 'react-router-dom';
import { endpoints } from '../../services/api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const submit = async (e) => {
    e.preventDefault(); setErr(''); setMsg('');
    try {
      const r = await endpoints.register(form);
      setMsg(`Registered! Verification link sent to email. Dev token: ${r.data.verificationToken} — open /verify-email/${r.data.verificationToken} or check server console.`);
    } catch (e) { setErr(e.response?.data?.message || 'Failed'); }
  };
  return (
    <div className="max-w-md mx-auto p-6 card mt-8">
      <h2 className="text-2xl font-bold">Create account</h2>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="input" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="input" placeholder="Password (min 6)" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button className="btn btn-primary w-full">Register</button>
      </form>
      {msg && <p className="text-green-700 text-sm mt-3 break-all">{msg}</p>}
      {err && <p className="text-red-600 text-sm mt-3">{err}</p>}
      <p className="text-sm mt-3"><Link to="/login" className="underline">Have an account? Login</Link></p>
    </div>
  );
}
