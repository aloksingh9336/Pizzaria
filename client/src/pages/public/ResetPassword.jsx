import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { endpoints } from '../../services/api';

export default function ResetPassword() {
  const { token } = useParams();
  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState('');
  const nav = useNavigate();
  const submit = async (e) => {
    e.preventDefault();
    try { await endpoints.reset(token, { password: pw }); setMsg('Reset done. Redirecting to login...'); setTimeout(() => nav('/login'), 1500); }
    catch (e) { setMsg(e.response?.data?.message || 'Failed'); }
  };
  return (
    <div className="max-w-md mx-auto card mt-8 p-6">
      <h2 className="text-xl font-bold">Reset password</h2>
      <form onSubmit={submit} className="mt-3 space-y-3">
        <input className="input" type="password" placeholder="New password" value={pw} onChange={(e) => setPw(e.target.value)} required />
        <button className="btn btn-primary w-full">Reset</button>
      </form>
      {msg && <p className="text-sm mt-3">{msg}</p>}
    </div>
  );
}
