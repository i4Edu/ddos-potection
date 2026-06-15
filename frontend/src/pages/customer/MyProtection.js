import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { getMyProtection } from '../../services/api';
import type { ICustomerProtection } from '../../types/api';

/**
 * Customer self-service portal — My Protection
 * Read-only account-level protection summary.
 */
function MyProtection() {
  const [protection, setProtection] = useState<ICustomerProtection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await getMyProtection();
      setProtection(res.data);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        navigate('/login');
        return;
      }
      setError('Failed to load protection data.');
      console.error('MyProtection load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={{ padding: '20px' }}>Loading protection data…</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>My Protection</h1>
        <p style={{ color: '#6c757d' }}>
          Read-only view of your account-level protection scope.
        </p>

        {error && (
          <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ borderBottom: '2px solid #007bff', paddingBottom: '8px' }}>
            Protection Summary
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                <th style={thStyle}>Username</th>
                <td style={tdStyle}>{protection?.username || '-'}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                <th style={thStyle}>ISP ID</th>
                <td style={tdStyle}>{protection?.isp_id || '-'}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                <th style={thStyle}>Scope</th>
                <td style={tdStyle}>{protection?.protection_scope || '-'}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2 style={{ borderBottom: '2px solid #28a745', paddingBottom: '8px' }}>
            Notes
          </h2>
          <p style={{ color: '#6c757d' }}>{protection?.message || 'No protection details available.'}</p>
        </section>
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

export default MyProtection;
