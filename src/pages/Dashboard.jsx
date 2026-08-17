import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Navigation, MapPin, CloudRain, X, MessageSquare, Sun, Cloud, CloudFog, CloudDrizzle, CloudSnow, CloudLightning } from 'lucide-react';
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
  const [isRainModalOpen, setIsRainModalOpen] = useState(false);
  const [rainMessageTemplate, setRainMessageTemplate] = useState(
    "Hi [Name], this is KG Lawn Services. Due to the weather today, we will have to push your lawn care service to tomorrow. Let us know if you have any questions!"
  );
  
  // Weather states
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    initWeather();
  }, []);

  async function fetchDashboardData() {
    const { data: customerList } = await supabase.from('customers').select('name, address, phone, notes');
    const customersCount = customerList ? customerList.length : 0;
    const { count: pendingCount } = await supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('status', 'Pending');
    const today = new Date().toISOString().split('T')[0];
    const { data: jobs } = await supabase.from('jobs').select('*').eq('date', today);
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
      const mappedJobs = jobs.map(job => {
        const match = customerList.find(c => c.name === job.customer_name);
        return {
          ...job,
          address: match ? match.address : 'No address saved',
          phone: match ? match.phone : '',
          notes: match ? match.notes : ''
        };
      });
      setTodayJobs(mappedJobs);
    }
  }

  // Geolocation and Open-Meteo Weather API setup
  const initWeather = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        () => {
          fetchWeather(43.6532, -79.3832); // Fallback to Toronto
        }
      );
    } else {
      fetchWeather(43.6532, -79.3832);
    }
  };

  async function fetchWeather(lat, lon) {
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`);
      const data = await res.json();
      
      let cityName = 'Local Area';
      try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        const geoData = await geoRes.json();
        cityName = geoData.address.city || geoData.address.town || geoData.address.village || 'Local Area';
      } catch (e) {
        console.log("Geocoding failed");
      }

      setWeather({
        temp: data.current.temperature_2m,
        code: data.current.weather_code,
        city: cityName
      });
    } catch (err) {
      console.error(err);
    }
  }

  const getWeatherInfo = (code) => {
    if (code === 0) return { label: 'Sunny', icon: <Sun size={22} style={{ color: '#fbbf24' }} /> };
    if ([1, 2, 3].includes(code)) return { label: 'Partly Cloudy', icon: <Cloud size={22} style={{ color: '#94a3b8' }} /> };
    if ([45, 48].includes(code)) return { label: 'Foggy', icon: <CloudFog size={22} style={{ color: '#64748b' }} /> };
    if ([51, 53, 55, 56, 57].includes(code)) return { label: 'Drizzle', icon: <CloudDrizzle size={22} style={{ color: '#60a5fa' }} /> };
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { label: 'Rainy', icon: <CloudRain size={22} style={{ color: '#3b82f6' }} /> };
    if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: 'Snowy', icon: <CloudSnow size={22} style={{ color: '#93c5fd' }} /> };
    if ([95, 96, 99].includes(code)) return { label: 'Thunderstorm', icon: <CloudLightning size={22} style={{ color: '#a78bfa' }} /> };
    return { label: 'Clear', icon: <Sun size={22} style={{ color: '#fbbf24' }} /> };
  };

  const handleMapRoute = () => {
    const validAddresses = todayJobs
      .map(job => job.address)
      .filter(addr => addr && addr !== 'No address saved' && addr.trim() !== '');

    if (validAddresses.length === 0) {
      alert("No valid addresses found for today's jobs.");
      return;
    }

    const mapsUrl = `https://www.google.com/maps/dir/Current+Location/${validAddresses.map(addr => encodeURIComponent(addr)).join('/')}`;
    window.open(mapsUrl, '_blank');
  };

  const sendRainDelayText = (job) => {
    if (!job.phone) {
      alert(`No phone number found for ${job.customer_name}.`);
      return;
    }
    const cleanPhone = job.phone.replace(/\D/g, '');
    const personalizedMessage = rainMessageTemplate.replace('[Name]', job.customer_name);
    window.location.href = `sms:${cleanPhone}?body=${encodeURIComponent(personalizedMessage)}`;
  };

  const rainModal = isRainModalOpen ? createPortal(
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 99999, padding: '20px', boxSizing: 'border-box'
    }}>
      <div style={{
        background: 'rgba(30, 41, 59, 0.98)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px', padding: '28px', width: '100%', maxWidth: '480px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.6)', maxHeight: '80vh', display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexShrink: 0 }}>
          <h2 style={{ fontSize: '20px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CloudRain size={20} style={{ color: '#60a5fa' }} /> Rain Delay Broadcast
          </h2>
          <button type="button" onClick={() => setIsRainModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        
        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '8px' }}>
          <div className="input-group">
            <label className="input-label">Message Template (use [Name] for client name)</label>
            <textarea 
              className="input-field" 
              rows="4" 
              value={rainMessageTemplate} 
              onChange={e => setRainMessageTemplate(e.target.value)}
              style={{ width: '100%', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>

          <h3 style={{ fontSize: '15px', color: '#94a3b8', marginBottom: '12px', marginTop: '16px' }}>Today's Scheduled Clients:</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {todayJobs.map(job => (
              <div key={job.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px', background: 'rgba(15,23,42,0.3)',
                borderRadius: '8px', border: '1px solid var(--border-color)'
              }}>
                <div>
                  <p style={{ fontWeight: '500', fontSize: '14px' }}>{job.customer_name}</p>
                  <p className="text-secondary" style={{ fontSize: '12px' }}>{job.phone || 'No phone saved'}</p>
                </div>
                <button 
                  onClick={() => sendRainDelayText(job)}
                  style={{
                    background: 'rgba(96, 165, 250, 0.1)', border: '1px solid rgba(96, 165, 250, 0.3)',
                    color: '#60a5fa', padding: '8px', borderRadius: '6px', cursor: 'pointer'
                  }}
                  title="Send rain delay text"
                  disabled={!job.phone}
                >
                  <MessageSquare size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', flexShrink: 0 }}>
          <button type="button" className="btn btn-outline" onClick={() => setIsRainModalOpen(false)}>Done</button>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div>
      <div style={{ marginBottom: '24px', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
        <img src={banner} alt="KG LS Banner" style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '200px', objectFit: 'cover', objectPosition: 'center' }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontSize: '28px' }}>Dashboard</h1>
        {weather && (
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px', margin: 0, borderRadius: '8px' }}>
            {getWeatherInfo(weather.code).icon}
            <div>
              <p style={{ fontWeight: '600', fontSize: '14px', margin: 0 }}>{weather.temp}°C - {getWeatherInfo(weather.code).label}</p>
              <p className="text-secondary" style={{ fontSize: '11px', margin: 0 }}>{weather.city}</p>
            </div>
          </div>
        )}
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
        <div style={{ display: 'flex', gap: '8px' }}>
          {todayJobs.length > 0 && (
            <>
              <button onClick={() => setIsRainModalOpen(true)} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '13px', borderColor: '#60a5fa', color: '#60a5fa' }}>
                <CloudRain size={15} style={{ marginRight: '6px' }} /> Broadcast Rain Delay
              </button>
              <button onClick={handleMapRoute} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                <Navigation size={15} style={{ marginRight: '6px' }} /> Map Today's Route
              </button>
            </>
          )}
        </div>
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
                {job.notes && (
                  <p style={{ fontSize: '12px', color: '#fbbf24', marginBottom: '4px', background: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px', border: '1px solid rgba(245,158,11,0.2)' }}>
                    ⚠️ Note: {job.notes}
                  </p>
                )}
                <p className="text-secondary" style={{ fontSize: '13px', marginTop: job.notes ? '4px' : '0' }}>{job.service} • {job.time}</p>
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

      {rainModal}
    </div>
  );
}

export default Dashboard;
