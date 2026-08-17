import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X, Trash2, Receipt } from 'lucide-react';
import { supabase } from '../supabaseClient';

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ description: '', amount: '', date: '', category: 'Fuel' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenses();
  }, []);

  async function fetchExpenses() {
    setLoading(true);
    const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false });
    if (!error && data) setExpenses(data);
    setLoading(false);
  }

  const handleSave = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('expenses').insert([formData]);
    if (!error) fetchExpenses();
    setIsModalOpen(false);
    setFormData({ description: '', amount: '', date: new Date().toISOString().split('T')[0], category: 'Fuel' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      await supabase.from('expenses').delete().eq('id', id);
      fetchExpenses();
    }
  };

  const openModal = () => {
    setFormData({ description: '', amount: '', date: new Date().toISOString().split('T')[0], category: 'Fuel' });
    setIsModalOpen(true);
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
          <h2 style={{ fontSize: '20px', color: '#f8fafc' }}>Log Expense</h2>
          <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <form onSubmit={handleSave}>
          <div className="input-group">
            <label className="input-label">Description</label>
            <input required type="text" className="input-field" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="e.g. Gas for mowers" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Amount</label>
              <input required type="text" className="input-field" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="e.g. $15.50" />
            </div>
            <div className="input-group">
              <label className="input-label">Date</label>
              <input required type="date" className="input-field" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
          </div>

          <div className="input-group" style={{ marginTop: '8px' }}>
            <label className="input-label">Category</label>
            <select className="input-field" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              <option value="Fuel">Fuel / Gas</option>
              <option value="Equipment">Equipment / Maintenance</option>
              <option value="Supplies">Supplies (String, Oil, Spray)</option>
              <option value="Marketing">Marketing / Flyers</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Expense</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '28px' }}>Expenses</h1>
        <button className="btn btn-primary" onClick={openModal}><Plus size={16} style={{ marginRight: '8px' }} /> Log Expense</button>
      </div>

      <div className="card" style={{ padding: '16px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: '500' }}>Date</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: '500' }}>Description</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: '500' }}>Category</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: '500' }}>Amount</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: '500', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ padding: '16px', textAlign: 'center' }}>Loading...</td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '16px', textAlign: 'center' }}>No expenses logged.</td></tr>
              ) : expenses.map((exp) => (
                <tr key={exp.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{exp.date}</td>
                  <td style={{ padding: '12px 16px', fontWeight: '500' }}>{exp.description}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className="badge" style={{ 
                      background: 'rgba(239, 68, 68, 0.1)', 
                      color: '#f87171', 
                      border: '1px solid rgba(239, 68, 68, 0.2)' 
                    }}>
                      {exp.category}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: '600', color: '#f87171' }}>{exp.amount}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button onClick={() => handleDelete(exp.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', padding: '4px', cursor: 'pointer' }}>
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

export default Expenses;
