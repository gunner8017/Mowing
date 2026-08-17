import { LayoutDashboard, Users, CalendarDays, FileText, DollarSign, Settings } from 'lucide-react';
import logo from '../assets/image2.png';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={22} /> },
  { id: 'customers', label: 'Customers', icon: <Users size={22} /> },
  { id: 'schedule', label: 'Schedule', icon: <CalendarDays size={22} /> },
  { id: 'invoices', label: 'Invoices', icon: <FileText size={22} /> },
  { id: 'earnings', label: 'Earnings', icon: <DollarSign size={22} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={22} /> },
];

function Sidebar({ activeTab, setActiveTab }) {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="desktop-sidebar" style={{
        width: '240px',
        background: 'rgba(15, 23, 42, 0.8)',
        borderRight: '1px solid var(--border-color)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: 'blur(10px)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <img src={logo} alt="Logo" style={{ width: '120px', height: '120px', borderRadius: '12px', objectFit: 'cover', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }} />
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary-green)', textAlign: 'center' }}>Lawn Services</h2>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                width: '100%', padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: activeTab === item.id ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                color: activeTab === item.id ? 'var(--primary-green)' : 'var(--text-secondary)',
                border: 'none', textAlign: 'left',
                transition: 'all var(--transition-fast)',
                fontWeight: activeTab === item.id ? '600' : '500',
              }}
              onMouseEnter={e => { if (activeTab !== item.id) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
              onMouseLeave={e => { if (activeTab !== item.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="mobile-bottom-nav" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(15, 23, 42, 0.97)',
        borderTop: '1px solid var(--border-color)',
        backdropFilter: 'blur(16px)',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        padding: '8px 0 calc(8px + env(safe-area-inset-bottom))',
        zIndex: 500,
      }}>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              background: 'transparent', border: 'none', padding: '6px 16px',
              color: activeTab === item.id ? 'var(--primary-green)' : 'var(--text-muted)',
              fontSize: '11px', fontWeight: activeTab === item.id ? '600' : '400',
              transition: 'all var(--transition-fast)', cursor: 'pointer',
            }}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}

export default Sidebar;
