import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Schedule from './pages/Schedule';
import Invoices from './pages/Invoices';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'customers':
        return <Customers />;
      case 'schedule':
        return <Schedule />;
      case 'invoices':
        return <Invoices />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container" style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main style={{ flex: 1, padding: '16px', overflow: 'visible' }}>
        <div className="container animate-fade-in">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
