import { useState, useEffect } from 'react';
import { DollarSign, AlertCircle, TrendingUp, TrendingDown, MessageSquare } from 'lucide-react';
import { supabase } from '../supabaseClient';

function Earnings() {
  const [stats, setStats] = useState({
    totalPaid: 0,
    totalPending: 0,
    totalExpenses: 0,
    netProfit: 0,
  });
  const [pendingInvoices, setPendingInvoices] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarningsData();
  }, []);

  async function fetchEarningsData() {
    setLoading(true);
    
    // Fetch all invoices
    const { data: invoices, error } = await supabase.from('invoices').select('*');
    // Fetch customers for phone numbers (for nagging texts)
    const { data: customerData } = await supabase.from('customers').select('name, phone');
    if (customerData) setCustomers(customerData);

    // Fetch settings
    const { data: settingsData } = await supabase.from('settings').select('*').limit(1);
    if (settingsData && settingsData.length > 0) setSettings(settingsData[0]);

    // Fetch expenses
    const { data: expensesData } = await supabase.from('expenses').select('amount');

    if (!error && invoices) {
      let paidSum = 0;
      let pendingSum = 0;
      const customerTotals = {};

      invoices.forEach(inv => {
        const amount = parseFloat(inv.amount.replace(/[^0-9.-]+/g, ""));
        const validAmount = isNaN(amount) ? 0 : amount;

        if (inv.status === 'Paid') {
          paidSum += validAmount;
          customerTotals[inv.customer_name] = (customerTotals[inv.customer_name] || 0) + validAmount;
        } else if (inv.status === 'Pending') {
          pendingSum += validAmount;
        }
      });

      let expenseSum = 0;
      if (expensesData) {
        expensesData.forEach(exp => {
          const amount = parseFloat(exp.amount.replace(/[^0-9.-]+/g, ""));
          const validAmount = isNaN(amount) ? 0 : amount;
          expenseSum += validAmount;
        });
      }

      // Format top customers
      const sortedCustomers = Object.entries(customerTotals)
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      setStats({
        totalPaid: paidSum,
        totalPending: pendingSum,
        totalExpenses: expenseSum,
        netProfit: paidSum - expenseSum,
      });

      setPendingInvoices(invoices.filter(inv => inv.status === 'Pending'));
      setTopCustomers(sortedCustomers);
    }
    setLoading(false);
  }

  const handleTextInvoice = (inv) => {
    const customer = customers.find(c => c.name === inv.customer_name);
    if (!customer || !customer.phone) {
      alert("Could not find a phone number for this customer.");
      return;
    }
    const cleanPhone = customer.phone.replace(/\D/g, '');
    const bizName = settings?.business_name || 'KG Lawn Services';
    const eTransferInfo = settings?.etransfer_email 
      ? ` Please send Interac e-Transfer to: ${settings.etransfer_email}.` 
      : '';
      
    const message = `Friendly reminder from ${bizName}: Invoice ${inv.invoice_id} for ${inv.amount} is currently pending.${eTransferInfo} Please send payment when you get a chance. Thank you!`;
    window.location.href = `sms:${cleanPhone}?body=${encodeURIComponent(message)}`;
  };

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px' }}>Earnings & Profits</h1>
      </div>

      {loading ? (
        <p>Loading financial data...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Stats Grid */}
          <div className="grid md:grid-cols-4" style={{ gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div className="card" style={{ borderLeft: '4px solid var(--primary-green)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 className="text-secondary" style={{ fontSize: '14px' }}>Total Revenue (Paid)</h3>
                <TrendingUp size={20} className="text-green" />
              </div>
              <p className="text-green" style={{ fontSize: '28px', fontWeight: '700' }}>${stats.totalPaid.toFixed(2)}</p>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 className="text-secondary" style={{ fontSize: '14px' }}>Expenses</h3>
                <TrendingDown size={20} style={{ color: '#ef4444' }} />
              </div>
              <p style={{ fontSize: '28px', fontWeight: '700', color: '#f87171' }}>${stats.totalExpenses.toFixed(2)}</p>
            </div>

            <div className="card" style={{ borderLeft: `4px solid ${stats.netProfit >= 0 ? 'var(--primary-green)' : '#ef4444'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 className="text-secondary" style={{ fontSize: '14px' }}>Net Profit</h3>
                <DollarSign size={20} style={{ color: stats.netProfit >= 0 ? 'var(--primary-green)' : '#ef4444' }} />
              </div>
              <p style={{ 
                fontSize: '28px', 
                fontWeight: '700', 
                color: stats.netProfit >= 0 ? 'var(--primary-green)' : '#f87171' 
              }}>
                ${stats.netProfit.toFixed(2)}
              </p>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #fbbf24' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 className="text-secondary" style={{ fontSize: '14px' }}>Outstanding</h3>
                <AlertCircle size={20} style={{ color: '#fbbf24' }} />
              </div>
              <p style={{ fontSize: '28px', fontWeight: '700', color: '#fbbf24' }}>${stats.totalPending.toFixed(2)}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2" style={{ gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
            
            {/* Unpaid / Debtors List */}
            <div className="card">
              <h2 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={18} style={{ color: '#fbbf24' }} /> Unpaid Invoices
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pendingInvoices.length === 0 ? (
                  <p className="text-secondary">Great news! Everyone is paid up.</p>
                ) : (
                  pendingInvoices.map(inv => (
                    <div key={inv.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '12px 16px', background: 'rgba(245, 158, 11, 0.05)',
                      borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.15)'
                    }}>
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: '600' }}>{inv.customer_name}</h4>
                        <p className="text-secondary" style={{ fontSize: '13px' }}>{inv.invoice_id} • Due since {inv.date_issued}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: '600', color: '#fbbf24' }}>{inv.amount}</span>
                        <button onClick={() => handleTextInvoice(inv)} style={{
                          background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)',
                          color: '#fbbf24', padding: '6px', borderRadius: '6px', cursor: 'pointer'
                        }} title="Send reminder text">
                          <MessageSquare size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Top Customer Leaderboard */}
            <div className="card">
              <h2 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} className="text-green" /> Top Customers
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {topCustomers.length === 0 ? (
                  <p className="text-secondary">No transaction history yet.</p>
                ) : (
                  topCustomers.map((cust, i) => (
                    <div key={cust.name} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '12px 16px', background: 'rgba(255,255,255,0.02)',
                      borderRadius: '8px', border: '1px solid var(--border-color)'
                    }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span style={{ 
                          width: '24px', height: '24px', borderRadius: '50%', 
                          background: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary-green)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '13px', fontWeight: '600'
                        }}>
                          {i + 1}
                        </span>
                        <span style={{ fontWeight: '500' }}>{cust.name}</span>
                      </div>
                      <span className="text-green" style={{ fontWeight: '600' }}>${cust.total.toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}

export default Earnings;
