import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Save, Building, Mail } from 'lucide-react';

function Settings() {
  const [businessName, setBusinessName] = useState('KG Lawn Services');
  const [etransferEmail, setEtransferEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    const { data, error } = await supabase.from('settings').select('*').limit(1);
    if (!error && data && data.length > 0) {
      setBusinessName(data[0].business_name);
      setEtransferEmail(data[0].etransfer_email);
    }
    setLoading(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    // Fetch first to see if a record exists
    const { data } = await supabase.from('settings').select('id').limit(1);
    
    if (data && data.length > 0) {
      // Update existing
      const { error } = await supabase
        .from('settings')
        .update({ business_name: businessName, etransfer_email: etransferEmail })
        .eq('id', data[0].id);
      
      if (!error) setMessage('Settings updated successfully! ✅');
      else setMessage('Failed to save settings. ❌');
    } else {
      // Insert new
      const { error } = await supabase
        .from('settings')
        .insert([{ business_name: businessName, etransfer_email: etransferEmail }]);
      
      if (!error) setMessage('Settings created successfully! ✅');
      else setMessage('Failed to save settings. ❌');
    }
    setSaving(false);
  }

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px' }}>Settings</h1>
      </div>

      <div className="card" style={{ maxWidth: '600px', padding: '28px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Business Configuration</h2>
        
        {loading ? (
          <p>Loading settings...</p>
        ) : (
          <form onSubmit={handleSave}>
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building size={16} /> Business Name
              </label>
              <input 
                required 
                type="text" 
                className="input-field" 
                value={businessName} 
                onChange={e => setBusinessName(e.target.value)}
                placeholder="e.g. KG Lawn Services"
              />
            </div>

            <div className="input-group" style={{ marginTop: '20px' }}>
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={16} /> Interac e-Transfer Email
              </label>
              <input 
                required 
                type="email" 
                className="input-field" 
                value={etransferEmail} 
                onChange={e => setEtransferEmail(e.target.value)}
                placeholder="e.g. pay@kglawnservices.ca"
              />
            </div>

            {message && (
              <p style={{ 
                marginTop: '16px', fontSize: '14px', 
                color: message.includes('✅') ? 'var(--primary-green)' : '#ef4444' 
              }}>
                {message}
              </p>
            )}

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={saving}
              style={{ marginTop: '28px', display: 'flex', gap: '8px', alignItems: 'center' }}
            >
              <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Settings;
