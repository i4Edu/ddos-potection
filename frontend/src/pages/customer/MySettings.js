import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';

/**
 * Customer self-service portal — My Settings
 * Manage customer notification email, webhook URL and alert threshold.
 */
function MySettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [notificationEmail, setNotificationEmail] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [alertThreshold, setAlertThreshold] = useState('high');
  const navigate = useNavigate();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/customer/my-settings', {
        headers: { Authorization: 'Bearer ' + token },
      });
      if (res.status === 401) {
        navigate('/login');
        return;
      }
      const data = res.ok ? await res.json() : {};
      setNotificationEmail(data.notification_email || '');
      setWebhookUrl(data.webhook_url || '');
      setAlertThreshold(data.alert_threshold || 'high');
    } catch (err) {
      setError('Failed to load settings.');
      console.error('MySettings load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/customer/my-settings', {
        method: 'PUT',
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notification_email: notificationEmail || null,
          webhook_url: webhookUrl || null,
          alert_threshold: alertThreshold,
        }),
      });
      if (res.status === 401) {
        navigate('/login');
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Save failed');
      }
      setSuccessMsg('Settings saved successfully.');
    } catch (err) {
      setError(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={{ padding: '20px' }}>Loading settings…</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1>My Settings</h1>
        <p style={{ color: '#6c757d' }}>
          Manage your customer notification preferences.
        </p>

        {error && (
          <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px', marginBottom: '16px' }}>
            {error}
          </div>
        )}
        {successMsg && (
          <div style={{ background: '#d4edda', color: '#155724', padding: '10px', borderRadius: '4px', marginBottom: '16px' }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSave}>
          <section style={sectionStyle}>
            <h2 style={sectionHeaderStyle}>Alert Preferences</h2>
            <label style={labelStyle}>Notification email</label>
            <input
              type="email"
              value={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.value)}
              placeholder="alerts@example.com"
              style={inputStyle}
            />

            <label style={{ ...labelStyle, marginTop: '12px' }}>Webhook URL (optional)</label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://example.com/webhook"
              style={inputStyle}
            />

            <label style={{ ...labelStyle, marginTop: '12px' }}>Alert threshold</label>
            <select
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(e.target.value)}
              style={inputStyle}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </section>

          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '10px 24px',
              background: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}

const sectionStyle = {
  marginBottom: '28px',
  padding: '16px',
  border: '1px solid #dee2e6',
  borderRadius: '8px',
};

const sectionHeaderStyle = {
  marginTop: 0,
  marginBottom: '12px',
  fontSize: '1.1rem',
  borderBottom: '1px solid #dee2e6',
  paddingBottom: '8px',
};

const labelStyle = {
  display: 'block',
  color: '#6c757d',
  fontSize: '0.9rem',
  marginBottom: '4px',
};

const inputStyle = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid #ced4da',
  borderRadius: '4px',
  fontSize: '0.95rem',
  boxSizing: 'border-box',
};

export default MySettings;
