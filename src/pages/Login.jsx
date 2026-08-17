import { useState } from 'react';
import { supabase } from '../supabaseClient';
import logo from '../assets/image2.png';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError('Wrong email or password. Try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'var(--bg-dark)',
      backgroundImage: 'radial-gradient(at 0% 0%, rgba(16, 185, 129, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(52, 211, 153, 0.1) 0px, transparent 50%)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'rgba(30, 41, 59, 0.8)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '40px 32px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img src={logo} alt="KG Lawn Services" style={{
            width: '90px', height: '90px', borderRadius: '12px',
            objectFit: 'cover', marginBottom: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
          }} />
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#f8fafc', marginBottom: '4px' }}>KG Lawn Services</h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Sign in to manage your business</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label className="input-label">Email</label>
            <input
              required
              type="email"
              className="input-field"
              placeholder="you@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              required
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          {error && (
            <p style={{
              color: '#ef4444', fontSize: '14px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px', padding: '10px 14px', marginBottom: '16px'
            }}>{error}</p>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '8px', padding: '14px', fontSize: '16px' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
