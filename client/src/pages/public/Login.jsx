import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const { login } = useAuth();
  const nav = useNavigate();
  const submit = async (e) => {
    e.preventDefault(); setErr('');
    try { await login(form.email, form.password); nav('/dashboard'); }
    catch (e) { setErr(e.response?.data?.message || 'Login failed'); }
  };
  return (
    <div className="max-w-md mx-auto p-6 card mt-8">
      <h2 className="text-2xl font-bold">Login</h2>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <input className="input" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="input" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button className="btn btn-primary w-full">Login</button>
      </form>
      {err && <p className="text-red-600 text-sm mt-3">{err}</p>}
      <div className="text-sm mt-3 flex justify-between">
        <Link to="/forgot-password" className="underline">Forgot password?</Link>
        <Link to="/register" className="underline">Register</Link>
      </div>
    </div>
  );
}
