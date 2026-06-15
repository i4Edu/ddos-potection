import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { getMyAlerts } from '../../services/api';
import type { ICustomerAlertItem } from '../../types/api';

/**
 * Customer self-service portal — My Alerts
 * Read-only feed of DDoS alerts affecting the customer's ISP scope.
 */
function MyAlerts() {
  const [alerts, setAlerts] = useState<ICustomerAlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'resolved'
  const navigate = useNavigate();

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const res = await getMyAlerts();
      setAlerts(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        navigate('/login');
        return;
      }
      setError('Failed to load alerts.');
      console.error('MyAlerts load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const severityColour = (severity) => {
    const map = { critical: '#dc3545', high: '#fd7e14', medium: '#ffc107', low: '#28a745' };
    return map[severity?.toLowerCase()] || '#6c757d';
  };

  const filtered = alerts.filter((a) => {
    if (filter === 'active') return a.status === 'active' || a.status === 'mitigated';
    if (filter === 'resolved') return a.status === 'resolved';
    return true;
  });

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={{ padding: '20px' }}>Loading alerts…</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>My Alerts</h1>
        <p style={{ color: '#6c757d' }}>
          DDoS alerts affecting your protected ISP scope (read-only).
        </p>

        {error && (
          <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
          {['all', 'active', 'resolved'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 16px',
                borderRadius: '4px',
                border: '1px solid #dee2e6',
                background: filter === f ? '#007bff' : '#fff',
                color: filter === f ? '#fff' : '#333',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {f}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', alignSelf: 'center', color: '#6c757d' }}>
            {filtered.length} alert{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filtered.length === 0 ? (
          <p style={{ color: '#6c757d' }}>No alerts to display.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={thStyle}>Severity</th>
                <th style={thStyle}>Attack Type</th>
                <th style={thStyle}>Target IP</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Detected At</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={tdStyle}>
                    <span
                      style={{
                        background: severityColour(a.severity),
                        color: '#fff',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        textTransform: 'capitalize',
                      }}
                    >
                      {a.severity || 'info'}
                    </span>
                  </td>
                  <td style={tdStyle}>{a.alert_type || '-'}</td>
                  <td style={tdStyle}><code>{a.target_ip || a.source_ip || '-'}</code></td>
                  <td style={tdStyle}>
                    {a.status === 'resolved' ? (
                      <span style={{ color: '#28a745' }}>✓ Resolved</span>
                    ) : a.status === 'mitigated' ? (
                      <span style={{ color: '#fd7e14' }}>⟳ Mitigated</span>
                    ) : (
                      <span style={{ color: '#dc3545' }}>● Active</span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    {a.created_at ? new Date(a.created_at).toLocaleString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const thStyle = {
  padding: '10px 12px',
  textAlign: 'left',
  fontWeight: '600',
  borderBottom: '2px solid #dee2e6',
};

const tdStyle = {
  padding: '10px 12px',
  verticalAlign: 'middle',
};

export default MyAlerts;
