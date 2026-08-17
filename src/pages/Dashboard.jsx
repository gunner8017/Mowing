import { useState, useEffect } from 'react';
import { Navigation, MapPin } from 'lucide-react';
import banner from '../assets/image1.png';
import { supabase } from '../supabaseClient';

function Dashboard() {
  const [stats, setStats] = useState({
    jobsToday: 0,
    revenueThisWeek: 0,
    activeCustomers: 0,
    pendingInvoices: 0
  });
  const [todayJobs, setTodayJobs] = useState([]);
  const [loadingRoute, setLoadingRoute] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    // Fetch Customers (need count and address mapping)
    const { data: customerList } = await supabase.from('customers').select('name, address');
    const customersCount = customerList ? customerList.length : 0;
    
    // Fetch Pending Invoices count
    const { count: pendingCount } = await supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('status', 'Pending');

    // Fetch Jobs for today
    const today = new Date().toISOString().split('T')[0];
    const { data: jobs } = await supabase.from('jobs').select('*').eq('date', today);
    
    // Fetch all paid invoices for revenue calculation
    const { data: paidInvoices } = await supabase.from('invoices').select('amount').eq('status', 'Paid');
    let revenue = 0;
    if (paidInvoices) {
      revenue = paidInvoices.reduce((acc, inv) => {
        const num = parseFloat(inv.amount.replace(/[^0-9.-]+/g,""));
        return acc + (isNaN(num) ? 0 : num);
      }, 0);
    }

    setStats({
      jobsToday: jobs ? jobs.length : 0,
      revenueThisWeek: revenue,
      activeCustomers: customersCount || 0,
      pendingInvoices: pendingCount || 0
    });

    if (jobs && customerList) {
      // Map addresses to today's jobs
      const mappedJobs = jobs.map(job => {
        const match = customerList.find(c => c.name === job.customer_name);
        return {
          ...job,
          address: match ? match.address : 'No address saved'
        };
      });
      setTodayJobs(mappedJobs);
    }
  }

  const toggleJobStatus = async (job) => {
    const newStatus = job.status === 'Scheduled' ? 'Completed' : 'Scheduled';
    await supabase.from('jobs').update({ status: newStatus }).eq('id', job.id);
    fetchDashboardData();
  };

  const handleMapRoute = () => {
    const validAddresses = todayJobs
      .map(job => job.address)
      .filter(addr => addr && addr !== 'No address saved' && addr.trim() !== '');

    if (validAddresses.length === 0) {
      alert("No valid addresses found for today's jobs. Make sure customers have addresses saved!");
      return;
    }

    // Opens Google Maps routing from Current Location through all waypoints
    const mapsUrl = `https://www.google.com/maps/dir/Current+Location/${validAddresses.map(addr => encodeURIComponent(addr)).join('/')}`;
    window.open(mapsUrl, '_blank');
  };

  return (
    <div>
      <div style={{ marginBottom: '24px', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
        <img src={banner} alt="KG LS Banner" style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '200px', objectFit: 'cover', objectPosition: 'center' }} />
      </div>

      <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '28px' }}>Dashboard</h1>
      </div>

      <div className="grid md:grid-cols-2 md:grid-cols-4" style={{ gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="card">
          <h3 className="text-secondary" style={{ fontSize: '14px', marginBottom: '8px' }}>Jobs Today</h3>
          <p className="text-green" style={{ fontSize: '32px', fontWeight: '700' }}>{stats.jobsToday}</p>
        </div>
        <div className="card">
          <h3 className="text-secondary" style={{ fontSize: '14px', marginBottom: '8px' }}>Total Revenue</h3>
          <p className="text-primary" style={{ fontSize: '32px', fontWeight: '700' }}>${stats.revenueThisWeek.toFixed(2)}</p>
        </div>
        <div className="card">
          <h3 className="text-secondary" style={{ fontSize: '14px', marginBottom: '8px' }}>Active Customers</h3>
          <p className="text-primary" style={{ fontSize: '32px', fontWeight: '700' }}>{stats.activeCustomers}</p>
        </div>
        <div className="card">
          <h3 className="text-secondary" style={{ fontSize: '14px', marginBottom: '8px' }}>Pending Invoices</h3>
          <p className="text-yellow" style={{ fontSize: '32px', fontWeight: '700', color: '#fbbf24' }}>{stats.pendingInvoices}</p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '28px', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontSize: '20px' }}>Today's Schedule</h2>
        {todayJobs.length > 0 && (
          <button onClick={handleMapRoute} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
            <Navigation size={15} style={{ marginRight: '6px' }} /> Map Today's Route
          </button>
        )}
      </div>

      <div className="card" style={{ padding: '0' }}>
        <ul style={{ listStyle: 'none' }}>
          {todayJobs.length === 0 ? (
            <li style={{ padding: '16px' }} className="text-secondary">No jobs scheduled for today.</li>
          ) : todayJobs.map((job, i, arr) => (
            <li key={job.id} style={{
              padding: '16px',
              borderBottom: i < arr.length - 1 ? 'var(--glass-border)' : 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <p style={{ fontWeight: '600', marginBottom: '4px', fontSize: '16px' }}>{job.customer_name}</p>
                <p className="text-secondary" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <MapPin size={13} /> {job.address}
                </p>
                <p className="text-secondary" style={{ fontSize: '13px' }}>{job.service} • {job.time}</p>
              </div>
              <div>
                <button 
                  onClick={() => toggleJobStatus(job)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                  className={`badge ${job.status === 'Completed' ? 'badge-green' : 'badge-yellow'}`}
                >
                  {job.status}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
