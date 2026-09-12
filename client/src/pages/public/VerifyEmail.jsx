import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { endpoints } from '../../services/api';

export default function VerifyEmail() {
  const { token } = useParams();
  const [msg, setMsg] = useState('Verifying...');
  useEffect(() => {
    if (!token) { setMsg('No token. Paste the verification link from your email / server console.'); return; }
    endpoints.verifyEmail(token).then(() => setMsg('Email verified! You can now log in.')).catch((e) => setMsg(e.response?.data?.message || 'Verification failed'));
  }, [token]);
  return (
    <div className="max-w-md mx-auto card mt-8 p-6 text-center">
      <h2 className="text-xl font-bold">Email verification</h2>
      <p className="mt-3">{msg}</p>
      <Link to="/login" className="btn btn-primary inline-block mt-4">Go to Login</Link>
    </div>
  );
}
