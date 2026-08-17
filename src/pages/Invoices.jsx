import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X, Trash2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ invoice_id: '', customer_name: '', amount: '', date_issued: '', status: 'Pending' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
    fetchCustomers();
  }, []);

  async function fetchInvoices() {
    setLoading(true);
    const { data, error } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
    if (!error && data) setInvoices(data);
    setLoading(false);
  }

  async function fetchCustomers() {
    const { data } = await supabase.from('customers').select('id, name').order('name');
    if (data) setCustomers(data);
  }

  // Auto-generate invoice ID
  const openModal = () => {
    const newId = `INV-${String(invoices.length + 1).padStart(3, '0')}`;
    setFormData({ invoice_id: newId, customer_name: '', amount: '', date_issued: new Date().toISOString().split('T')[0], status: 'Pending' });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('invoices').insert([formData]);
    if (!error) fetchInvoices();
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      await supabase.from('invoices').delete().eq('id', id);
      fetchInvoices();
    }
  };

  const toggleStatus = async (inv) => {
    const newStatus = inv.status === 'Pending' ? 'Paid' : 'Pending';
    await supabase.from('invoices').update({ status: newStatus }).eq('id', inv.id);
    fetchInvoices();
  };

  const modal = isModalOpen ? createPortal(
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 99999, padding: '20px', boxSizing: 'border-box'
    }}>
      <div style={{
        background: 'rgba(30, 41, 59, 0.98)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px', padding: '28px', width: '100%', maxWidth: '480px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.6)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', color: '#f8fafc' }}>Create Invoice</h2>
          <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Invoice ID</label>
              <input required type="text" className="input-field" value={formData.invoice_id} onChange={e => setFormData({...formData, invoice_id: e.target.value})} />
            </div>
            <div className="input-group">
              <label className="input-label">Date Issued</label>
              <input required type="date" className="input-field" value={formData.date_issued} onChange={e => setFormData({...formData, date_issued: e.target.value})} />
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Customer</label>
            <select required className="input-field" value={formData.customer_name} onChange={e => setFormData({...formData, customer_name: e.target.value})}>
              <option value="">-- Select a Customer --</option>
              {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Amount</label>
            <input required type="text" className="input-field" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="e.g. $30.00" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Invoice</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '28px' }}>Invoices</h1>
        <button className="btn btn-primary" onClick={openModal}><Plus size={16} style={{ marginRight: '8px' }} /> Create Invoice</button>
      </div>

      <div className="card" style={{ padding: '16px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: '500' }}>Invoice ID</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: '500' }}>Customer</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: '500' }}>Date</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: '500' }}>Amount</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: '500' }}>Status</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: '500', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ padding: '16px', textAlign: 'center' }}>Loading...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: '16px', textAlign: 'center' }}>No invoices found.</td></tr>
              ) : invoices.map((inv) => (
                <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '500', color: 'var(--primary-green)' }}>{inv.invoice_id}</td>
                  <td style={{ padding: '12px 16px' }}>{inv.customer_name}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{inv.date_issued}</td>
                  <td style={{ padding: '12px 16px', fontWeight: '600' }}>{inv.amount}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => toggleStatus(inv)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                      className={`badge ${inv.status === 'Paid' ? 'badge-green' : 'badge-yellow'}`}>
                      {inv.status}
                    </button>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button onClick={() => handleDelete(inv.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', padding: '4px', cursor: 'pointer' }}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal}
    </div>
  );
}

export default Invoices;
