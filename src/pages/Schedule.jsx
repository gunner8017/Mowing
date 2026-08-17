import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2, X } from 'lucide-react';
import { supabase } from '../supabaseClient';

function Schedule() {
  const [jobs, setJobs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ customer_name: '', service: '', price: '', date: '', time: '', status: 'Scheduled' });
  const [repeatMode, setRepeatMode] = useState('once');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
    fetchCustomers();
  }, []);

  async function fetchJobs() {
    setLoading(true);
    const { data, error } = await supabase.from('jobs').select('*').order('date', { ascending: true });
    if (!error && data) setJobs(data);
    setLoading(false);
  }

  async function fetchCustomers() {
    const { data } = await supabase.from('customers').select('id, name').order('name');
    if (data) setCustomers(data);
  }

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Split date to avoid timezone shift issues
    const [year, month, day] = formData.date.split('-').map(Number);
    const baseDate = new Date(year, month - 1, day);
    
    let repeatCount = 1;
    let dayInterval = 7;
    
    if (repeatMode === 'weekly') {
      repeatCount = 4; // Add next 4 weeks
      dayInterval = 7;
    } else if (repeatMode === 'biweekly') {
      repeatCount = 4; // Add next 4 bi-weekly cuts (8 weeks total)
      dayInterval = 14;
    }

    const jobsToInsert = [];
    for (let i = 0; i < repeatCount; i++) {
      const nextDate = new Date(baseDate);
      nextDate.setDate(baseDate.getDate() + (i * dayInterval));
      
      // Format back to YYYY-MM-DD
      const yyyy = nextDate.getFullYear();
      const mm = String(nextDate.getMonth() + 1).padStart(2, '0');
      const dd = String(nextDate.getDate()).padStart(2, '0');
      const dateString = `${yyyy}-${mm}-${dd}`;

      jobsToInsert.push({
        customer_name: formData.customer_name,
        service: formData.service,
        price: formData.price,
        date: dateString,
        time: formData.time,
        status: 'Scheduled'
      });
    }

    const { error } = await supabase.from('jobs').insert(jobsToInsert);
    if (!error) fetchJobs();
    
    setIsModalOpen(false);
    setRepeatMode('once');
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
        boxShadow: '0 25px 50px rgba(0,0,0,0.6)', maxHeight: '90vh', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', color: '#f8fafc' }}>Schedule Job</h2>
          <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <form onSubmit={handleSave}>
          <div className="input-group">
            <label className="input-label">Customer</label>
            <select required className="input-field" value={formData.customer_name} onChange={e => setFormData({...formData, customer_name: e.target.value})}>
              <option value="">-- Select a Customer --</option>
              {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Service</label>
            <select required className="input-field" value={formData.service} onChange={e => setFormData({...formData, service: e.target.value, price: e.target.value === 'Front & Back' ? '$30' : e.target.value === 'Front Only' || e.target.value === 'Back Only' ? '$20' : formData.price})}>
              <option value="">-- Select a Service --</option>
              <option value="Front & Back">Front & Back — $30</option>
              <option value="Front Only">Front Only — $20</option>
              <option value="Back Only">Back Only — $20</option>
              <option value="Weed Killer">Weed Killer Spray</option>
              <option value="Fertilizing">Fertilizing</option>
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Price</label>
            <input required type="text" className="input-field" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="e.g. $30" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Start Date</label>
              <input required type="date" className="input-field" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div className="input-group">
              <label className="input-label">Time</label>
              <input required type="time" className="input-field" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
            </div>
          </div>
          
          <div className="input-group" style={{ marginTop: '8px' }}>
            <label className="input-label">Repeat Job Settings</label>
            <select className="input-field" value={repeatMode} onChange={e => setRepeatMode(e.target.value)}>
              <option value="once">One-time job</option>
              <option value="weekly">Repeat Weekly (generates next 4 cuts)</option>
              <option value="biweekly">Repeat Bi-weekly (generates next 4 cuts over 8 weeks)</option>
            </select>
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
              borderRadius: '12px', border: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '12px'
            }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', minWidth: '80px', borderRight: '1px solid var(--border-color)', paddingRight: '16px' }}>
                  <p className="text-secondary" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>{job.date}</p>
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>{job.customer_name}</h3>
                  <p className="text-secondary" style={{ fontSize: '14px' }}>{job.service} • {job.time}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: '600', fontSize: '18px', marginBottom: '6px', color: 'var(--primary-green)' }}>{job.price}</p>
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
