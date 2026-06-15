import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { getMyReports, downloadReport } from '../../services/api';

/**
 * Customer self-service portal — My Reports
 * Read-only list of reports generated for the customer's ISP scope.
 */
function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await getMyReports();
      setReports(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (err?.response?.status === 401) {
        navigate('/login');
        return;
      }
      setError('Failed to load reports.');
      console.error('MyReports load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (report) => {
    try {
      const res = await downloadReport(report.id);
      const blob = new Blob([res.data]);
      const url = URL.createObjectURL(blob);
      const disposition = res.headers['content-disposition'] || '';
      const match = disposition.match(/filename="?([^"]+)"?/i);
      const fallbackExt = report.file_format || 'bin';
      const a = document.createElement('a');
      a.href = url;
      a.download = match?.[1] || `report_${report.id}.${fallbackExt}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Download failed.');
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={{ padding: '20px' }}>Loading reports…</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>My Reports</h1>
        <p style={{ color: '#6c757d' }}>
          Download historical attack reports for your account.
        </p>

        {error && (
          <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ borderBottom: '2px solid #007bff', paddingBottom: '8px' }}>
            Attack Reports ({reports.length})
          </h2>
          {reports.length === 0 ? (
            <p style={{ color: '#6c757d' }}>No reports available yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Period</th>
                  <th style={thStyle}>Generated</th>
                  <th style={thStyle}>Download</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={tdStyle}>{r.report_type || `Report #${r.id}`}</td>
                    <td style={tdStyle}>
                      {r.period_start && r.period_end
                        ? `${new Date(r.period_start).toLocaleDateString()} – ${new Date(r.period_end).toLocaleDateString()}`
                        : '-'}
                    </td>
                    <td style={tdStyle}>
                      {r.created_at ? new Date(r.created_at).toLocaleString() : '-'}
                    </td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => handleDownload(r)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '4px',
                          border: '1px solid #dee2e6',
                          background: '#fff',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                        }}
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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

export default MyReports;
