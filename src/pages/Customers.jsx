import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react';
import { supabase } from '../supabaseClient';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', address: '', phone: '', schedule: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchCustomers(); }, []);

  async function fetchCustomers() {
    setLoading(true);
    const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
    if (!error && data) setCustomers(data);
    setLoading(false);
  }

  const handleOpenModal = (customer = null) => {
    if (customer) {
      setEditingId(customer.id);
      setFormData({ name: customer.name, address: customer.address, phone: customer.phone, schedule: customer.schedule });
    } else {
      setEditingId(null);
      setFormData({ name: '', address: '', phone: '', schedule: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => { setIsModalOpen(false); setEditingId(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (editingId) {
      const { error } = await supabase.from('customers').update(formData).eq('id', editingId);
      if (!error) fetchCustomers();
    } else {
      const { error } = await supabase.from('customers').insert([formData]);
      if (!error) fetchCustomers();
    }
    handleCloseModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      await supabase.from('customers').delete().eq('id', id);
      fetchCustomers();
    }
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
          <h2 style={{ fontSize: '20px', color: '#f8fafc' }}>{editingId ? 'Edit Customer' : 'Add Customer'}</h2>
          <button type="button" onClick={handleCloseModal} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <form onSubmit={handleSave}>
          <div className="input-group">
            <label className="input-label">Name</label>
            <input required type="text" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="input-group">
            <label className="input-label">Address</label>
            <input required type="text" className="input-field" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
          </div>
          <div className="input-group">
            <label className="input-label">Phone</label>
            <input required type="text" className="input-field" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div className="input-group">
            <label className="input-label">Schedule</label>
            <input required type="text" className="input-field" value={formData.schedule} onChange={e => setFormData({...formData, schedule: e.target.value})} placeholder="e.g. Weekly (Friday)" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="btn btn-outline" onClick={handleCloseModal}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '28px' }}>Customers</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}><Plus size={16} style={{ marginRight: '8px' }} /> Add Customer</button>
      </div>

      <div className="card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="text" className="input-field" placeholder="Search customers..." style={{ width: '100%', paddingLeft: '40px' }} />
            </div>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: '500' }}>Name</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: '500' }}>Address</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: '500' }}>Phone</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: '500' }}>Schedule</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: '500', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ padding: '16px', textAlign: 'center' }}>Loading...</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '16px', textAlign: 'center' }}>No customers found.</td></tr>
              ) : customers.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '12px 16px', fontWeight: '500' }}>{c.name}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{c.address}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{c.phone}</td>
                  <td style={{ padding: '12px 16px' }}><span className="badge badge-green">{c.schedule}</span></td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button onClick={() => handleOpenModal(c)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', padding: '4px', cursor: 'pointer', marginRight: '8px' }}><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(c.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', padding: '4px', cursor: 'pointer' }}><Trash2 size={16} /></button>
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

export default Customers;
