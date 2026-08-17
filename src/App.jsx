import { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Schedule from './pages/Schedule';
import Invoices from './pages/Invoices';
import Expenses from './pages/Expenses';
import Earnings from './pages/Earnings';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { supabase } from './supabaseClient';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'customers': return <Customers />;
      case 'schedule': return <Schedule />;
      case 'invoices': return <Invoices />;
      case 'expenses': return <Expenses />;
      case 'earnings': return <Earnings />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
        <p style={{ color: '#10b981', fontSize: '18px' }}>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <div className="app-container" style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main style={{ flex: 1, padding: '16px', overflow: 'visible' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
              color: '#94a3b8', borderRadius: '8px', padding: '6px 12px',
              fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
        <div className="container animate-fade-in">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
