import { useState } from 'react';
import { endpoints } from '../../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    const r = await endpoints.forgot({ email });
    setMsg(`If that email exists, reset link sent. Dev token: ${r.data.resetToken || 'check server console'}`);
  };
  return (
    <div className="max-w-md mx-auto card mt-8 p-6">
      <h2 className="text-xl font-bold">Forgot password</h2>
      <form onSubmit={submit} className="mt-3 space-y-3">
        <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <button className="btn btn-primary w-full">Send reset link</button>
      </form>
      {msg && <p className="text-sm mt-3 break-all">{msg}</p>}
    </div>
  );
}
