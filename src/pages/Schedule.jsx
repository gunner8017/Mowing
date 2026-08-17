import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2, X } from 'lucide-react';
import { supabase } from '../supabaseClient';

function Schedule() {
  const [jobs, setJobs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ customer_name: '', service: '', price: '', date: '', time: '', status: 'Scheduled' });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchJobs(); }, []);

  async function fetchJobs() {
    setLoading(true);
    const { data, error } = await supabase.from('jobs').select('*').order('date', { ascending: true });
    if (!error && data) setJobs(data);
    setLoading(false);
  }

  const handleSave = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('jobs').insert([formData]);
    if (!error) fetchJobs();
    setIsModalOpen(false);
    setFormData({ customer_name: '', service: '', price: '', date: '', time: '', status: 'Scheduled' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      await supabase.from('jobs').delete().eq('id', id);
      fetchJobs();
    }
  };

  const toggleStatus = async (job) => {
    const newStatus = job.status === 'Scheduled' ? 'Completed' : 'Scheduled';
    await supabase.from('jobs').update({ status: newStatus }).eq('id', job.id);
    fetchJobs();
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
          <h2 style={{ fontSize: '20px', color: '#f8fafc' }}>Schedule Job</h2>
          <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <form onSubmit={handleSave}>
          <div className="input-group">
            <label className="input-label">Customer Name</label>
            <input required type="text" className="input-field" value={formData.customer_name} onChange={e => setFormData({...formData, customer_name: e.target.value})} />
          </div>
          <div className="input-group">
            <label className="input-label">Service Description</label>
            <input required type="text" className="input-field" value={formData.service} onChange={e => setFormData({...formData, service: e.target.value})} placeholder="e.g. Front & Back" />
          </div>
          <div className="input-group">
            <label className="input-label">Price</label>
            <input required type="text" className="input-field" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="e.g. $30" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Date</label>
              <input required type="date" className="input-field" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div className="input-group">
              <label className="input-label">Time</label>
              <input required type="time" className="input-field" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Job</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '28px' }}>Schedule</h1>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}><Plus size={16} style={{ marginRight: '8px' }} /> Schedule Job</button>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Upcoming Jobs</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {loading ? <p>Loading jobs...</p> : jobs.length === 0 ? (
            <p className="text-secondary">No jobs scheduled.</p>
          ) : jobs.map((job) => (
            <div key={job.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 16px', background: 'rgba(15,23,42,0.4)',
              borderRadius: '12px', border: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', minWidth: '100px', borderRight: '1px solid var(--border-color)', paddingRight: '24px' }}>
                  <p className="text-secondary" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>{job.date}</p>
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>{job.customer_name}</h3>
                  <p className="text-secondary" style={{ fontSize: '14px' }}>{job.service} • {job.time}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div>
                  <p style={{ fontWeight: '600', fontSize: '18px', marginBottom: '8px', color: 'var(--primary-green)' }}>{job.price}</p>
                  <button onClick={() => toggleStatus(job)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                    className={`badge ${job.status === 'Completed' ? 'badge-green' : 'badge-yellow'}`}>
                    {job.status}
                  </button>
                </div>
                <button onClick={() => handleDelete(job.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', padding: '8px', cursor: 'pointer' }}><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modal}
    </div>
  );
}

export default Schedule;
