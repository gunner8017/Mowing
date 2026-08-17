import { LayoutDashboard, Users, CalendarDays, FileText } from 'lucide-react';
import logo from '../assets/image2.png';

function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'customers', label: 'Customers', icon: <Users size={20} /> },
    { id: 'schedule', label: 'Schedule', icon: <CalendarDays size={20} /> },
    { id: 'invoices', label: 'Invoices', icon: <FileText size={20} /> },
  ];

  return (
    <div style={{
      width: '240px',
      background: 'rgba(15, 23, 42, 0.8)',
      borderRight: '1px solid var(--border-color)',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      backdropFilter: 'blur(10px)',
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
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: activeTab === item.id ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
              color: activeTab === item.id ? 'var(--primary-green)' : 'var(--text-secondary)',
              border: 'none',
              textAlign: 'left',
              transition: 'all var(--transition-fast)',
              fontWeight: activeTab === item.id ? '600' : '500',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== item.id) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== item.id) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;
