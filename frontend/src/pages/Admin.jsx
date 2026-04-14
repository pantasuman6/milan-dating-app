import { useState, useEffect } from 'react';
import { Users, Heart, MessageCircle, TrendingUp, Trash2, Ban, RefreshCw, ShieldCheck, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../components/AuthContext';

export default function Admin() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Check admin by trying the API call — if 403, show denied
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setAuthorized(true);
    } catch (err) {
      if (err.response?.status === 403) {
        setAuthorized(false);
      } else {
        toast.error('Failed to load admin data: ' + (err.response?.data?.error || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = async (userId, isActive) => {
    try {
      await api.put(`/admin/users/${userId}`, { is_active: !isActive });
      toast.success(isActive ? 'User deactivated' : 'User activated');
      fetchData();
    } catch { toast.error('Failed'); }
  };

  const deleteUser = async (userId, name) => {
    if (!confirm(`Permanently delete ${name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success(`${name} deleted`);
      fetchData();
    } catch { toast.error('Failed to delete'); }
  };

  // Access denied
  if (!loading && !authorized) return (
    <div className="page">
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <ShieldCheck size={48} style={{ color: 'var(--text-3)', marginBottom: 20 }} />
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', marginBottom: 12 }}>Admin Access Only</h2>
        <p style={{ color: 'var(--text-2)', marginBottom: 24 }}>Your account doesn't have admin privileges.</p>
        <p style={{ color: 'var(--text-3)', fontSize: '0.82rem' }}>
          To enable admin access, set <code style={{ background: 'var(--surface)', padding: '2px 6px', borderRadius: 4, color: 'var(--gold)' }}>ADMIN_EMAIL</code> on your Railway backend to <strong style={{ color: 'var(--text-2)' }}>{user?.email}</strong>
        </p>
      </div>
    </div>
  );

  if (loading) return (
    <div className="page">
      <div className="container" style={{ textAlign: 'center', paddingTop: 80 }}>
        <div style={{ fontSize: '2rem', marginBottom: 12, color: 'var(--gold)' }}>✦</div>
        <p style={{ color: 'var(--text-2)' }}>Loading admin data…</p>
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="container">

        {/* Header */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <ShieldCheck size={16} style={{ color: 'var(--gold)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin Panel</span>
            </div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Monitor and manage the Milan platform</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={fetchData}><RefreshCw size={14} /> Refresh</button>
        </div>

        {/* Tabs */}
        <div className="tab-bar">
          <button className={`tab-btn ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>Overview</button>
          <button className={`tab-btn ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>Users ({stats?.total_users || 0})</button>
          <button className={`tab-btn ${tab === 'activity' ? 'active' : ''}`} onClick={() => setTab('activity')}>Activity</button>
        </div>

        {/* OVERVIEW */}
        {tab === 'overview' && stats && (
          <>
            <div className="admin-grid">
              {[
                { value: stats.total_users ?? 0, label: 'Total Members', color: 'var(--gold)', variant: 'gold', Icon: Users },
                { value: stats.accepted_connections ?? 0, label: 'Connections Made', color: 'var(--rose)', variant: 'rose', Icon: Heart },
                { value: stats.total_messages ?? 0, label: 'Messages Sent', color: '#60A5FA', variant: 'blue', Icon: MessageCircle },
                { value: stats.new_this_week ?? 0, label: 'New This Week', color: '#34D399', variant: 'green', Icon: TrendingUp },
              ].map(({ value, label, color, variant, Icon }) => (
                <div key={label} className={`stat-card ${variant}`}>
                  <div className="stat-value" style={{ color }}>{value}</div>
                  <div className="stat-label">{label}</div>
                  <Icon size={20} style={{ position: 'absolute', right: 20, top: 20, color, opacity: 0.2 }} />
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Gender breakdown */}
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 24 }}>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', marginBottom: 20, color: 'var(--text-2)' }}>Gender Breakdown</h3>
                {[
                  { label: 'Male', value: stats.male_count ?? 0, color: '#60A5FA' },
                  { label: 'Female', value: stats.female_count ?? 0, color: 'var(--rose)' },
                  { label: 'Other', value: stats.other_count ?? 0, color: 'var(--gold)' },
                ].map(({ label, value, color }) => {
                  const pct = stats.total_users > 0 ? Math.round((value / stats.total_users) * 100) : 0;
                  return (
                    <div key={label} style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.82rem' }}>
                        <span style={{ color: 'var(--text-2)' }}>{label}</span>
                        <span style={{ color }}>{value} ({pct}%)</span>
                      </div>
                      <div style={{ height: 4, background: 'var(--surface)', borderRadius: 2 }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Platform health */}
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 24 }}>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', marginBottom: 20, color: 'var(--text-2)' }}>Platform Health</h3>
                {[
                  { label: 'Active Users', value: stats.active_users ?? 0, total: stats.total_users || 1, color: '#34D399' },
                  { label: 'Accepted Matches', value: stats.accepted_connections ?? 0, total: (stats.total_connections || 1), color: 'var(--gold)' },
                  { label: 'Pending Requests', value: stats.pending_requests ?? 0, total: (stats.total_connections || 1), color: '#60A5FA' },
                ].map(({ label, value, total, color }) => {
                  const pct = Math.min(100, Math.round((value / total) * 100));
                  return (
                    <div key={label} style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.82rem' }}>
                        <span style={{ color: 'var(--text-2)' }}>{label}</span>
                        <span style={{ color }}>{value}</span>
                      </div>
                      <div style={{ height: 4, background: 'var(--surface)', borderRadius: 2 }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* USERS */}
        {tab === 'users' && (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Age / Gender</th>
                    <th>Location</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {u.profile_pic
                            ? <img src={u.profile_pic} alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }} />
                            : <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>
                                {u.gender === 'female' ? '👩' : '👨'}
                              </div>
                          }
                          <span style={{ fontWeight: 500 }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-2)', fontSize: '0.8rem' }}>{u.email}</td>
                      <td style={{ color: 'var(--text-2)' }}>{u.age} · {u.gender}</td>
                      <td style={{ color: 'var(--text-2)', fontSize: '0.8rem' }}>{u.location || '—'}</td>
                      <td style={{ color: 'var(--text-3)', fontSize: '0.76rem' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${u.is_active ? 'badge-accepted' : 'badge-rejected'}`}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => toggleUser(u.id, u.is_active)} title={u.is_active ? 'Deactivate' : 'Activate'}>
                            {u.is_active ? <Ban size={13} /> : <CheckCircle size={13} />}
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u.id, u.name)} title="Delete permanently">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-3)', padding: 40 }}>No users yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ACTIVITY */}
        {tab === 'activity' && stats && (
          <div style={{ display: 'grid', gap: 12 }}>
            {[
              { label: 'Total Connection Requests Sent', value: stats.total_connections, color: 'var(--gold)' },
              { label: 'Accepted Matches', value: stats.accepted_connections, color: '#34D399' },
              { label: 'Pending Requests', value: stats.pending_requests, color: '#60A5FA' },
              { label: 'Rejected Requests', value: stats.rejected_requests, color: 'var(--rose)' },
              { label: 'Total Messages Exchanged', value: stats.total_messages, color: 'var(--gold)' },
              { label: 'Users with Photos Uploaded', value: stats.users_with_photos, color: '#34D399' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)' }}>
                <span style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>{label}</span>
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 700, color }}>{value ?? 0}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
