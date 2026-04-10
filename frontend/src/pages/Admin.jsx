import { useState, useEffect } from 'react';
import { Users, Heart, MessageCircle, TrendingUp, Trash2, Ban, RefreshCw, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Guard - redirect if not admin
  useEffect(() => {
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    if (!adminEmail || user?.email !== adminEmail) {
      toast.error('Access denied');
      navigate('/browse');
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const toggleUser = async (userId, isActive) => {
    try {
      await api.put(`/admin/users/${userId}`, { is_active: !isActive });
      toast.success(isActive ? 'User deactivated' : 'User activated');
      fetchData();
    } catch { toast.error('Failed to update user'); }
  };

  const deleteUser = async (userId, name) => {
    if (!confirm(`Permanently delete ${name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success(`${name} deleted`);
      fetchData();
    } catch { toast.error('Failed to delete user'); }
  };

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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <ShieldCheck size={20} style={{ color: 'var(--gold)' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin Panel</span>
            </div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Monitor and manage the platform</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={fetchData}><RefreshCw size={14} /> Refresh</button>
        </div>

        {/* Tabs */}
        <div className="tab-bar">
          <button className={`tab-btn ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>Overview</button>
          <button className={`tab-btn ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>Users ({stats?.total_users || 0})</button>
          <button className={`tab-btn ${tab === 'activity' ? 'active' : ''}`} onClick={() => setTab('activity')}>Activity</button>
        </div>

        {/* OVERVIEW TAB */}
        {tab === 'overview' && stats && (
          <>
            <div className="admin-grid">
              <div className="stat-card gold">
                <div className="stat-value" style={{ color: 'var(--gold)' }}>{stats.total_users ?? 0}</div>
                <div className="stat-label">Total Members</div>
                <Users size={20} style={{ position: 'absolute', right: 20, top: 20, color: 'var(--text-3)', opacity: 0.4 }} />
              </div>
              <div className="stat-card rose">
                <div className="stat-value" style={{ color: 'var(--rose)' }}>{stats.total_connections ?? 0}</div>
                <div className="stat-label">Connections Made</div>
                <Heart size={20} style={{ position: 'absolute', right: 20, top: 20, color: 'var(--text-3)', opacity: 0.4 }} />
              </div>
              <div className="stat-card blue">
                <div className="stat-value" style={{ color: '#60A5FA' }}>{stats.total_messages ?? 0}</div>
                <div className="stat-label">Messages Sent</div>
                <MessageCircle size={20} style={{ position: 'absolute', right: 20, top: 20, color: 'var(--text-3)', opacity: 0.4 }} />
              </div>
              <div className="stat-card green">
                <div className="stat-value" style={{ color: '#34D399' }}>{stats.new_this_week ?? 0}</div>
                <div className="stat-label">New This Week</div>
                <TrendingUp size={20} style={{ position: 'absolute', right: 20, top: 20, color: 'var(--text-3)', opacity: 0.4 }} />
              </div>
            </div>

            {/* Breakdown stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 24 }}>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', marginBottom: 20, color: 'var(--text-2)' }}>Gender Breakdown</h3>
                {[
                  { label: 'Male', value: stats.male_count ?? 0, color: '#60A5FA' },
                  { label: 'Female', value: stats.female_count ?? 0, color: 'var(--rose)' },
                  { label: 'Other', value: stats.other_count ?? 0, color: 'var(--gold)' },
                ].map(({ label, value, color }) => {
                  const pct = stats.total_users > 0 ? Math.round((value / stats.total_users) * 100) : 0;
                  return (
                    <div key={label} style={{ marginBottom: 14 }}>
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

              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 24 }}>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', marginBottom: 20, color: 'var(--text-2)' }}>Platform Health</h3>
                {[
                  { label: 'Active Users', value: stats.active_users ?? 0, total: stats.total_users ?? 1, color: '#34D399' },
                  { label: 'Pending Requests', value: stats.pending_requests ?? 0, total: stats.total_connections ?? 1, color: 'var(--gold)' },
                  { label: 'Accepted Matches', value: stats.accepted_connections ?? 0, total: stats.total_connections ?? 1, color: 'var(--rose)' },
                ].map(({ label, value, total, color }) => {
                  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                  return (
                    <div key={label} style={{ marginBottom: 14 }}>
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

        {/* USERS TAB */}
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
                            ? <img src={u.profile_pic} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                            : <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                                {u.gender === 'female' ? '👩' : '👨'}
                              </div>
                          }
                          <span style={{ fontWeight: 500 }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-2)', fontSize: '0.82rem' }}>{u.email}</td>
                      <td style={{ color: 'var(--text-2)' }}>{u.age} · {u.gender}</td>
                      <td style={{ color: 'var(--text-2)', fontSize: '0.82rem' }}>{u.location || '—'}</td>
                      <td style={{ color: 'var(--text-3)', fontSize: '0.78rem' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${u.is_active ? 'badge-accepted' : 'badge-rejected'}`}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => toggleUser(u.id, u.is_active)} title={u.is_active ? 'Deactivate' : 'Activate'}>
                            <Ban size={13} />
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u.id, u.name)} title="Delete">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ACTIVITY TAB */}
        {tab === 'activity' && stats && (
          <div style={{ display: 'grid', gap: 20 }}>
            {[
              { label: 'Total Connection Requests', value: stats.total_connections, color: 'var(--gold)' },
              { label: 'Accepted Matches', value: stats.accepted_connections, color: '#34D399' },
              { label: 'Pending Requests', value: stats.pending_requests, color: '#60A5FA' },
              { label: 'Rejected Requests', value: stats.rejected_requests, color: 'var(--rose)' },
              { label: 'Total Messages', value: stats.total_messages, color: 'var(--gold)' },
              { label: 'Users with Photos', value: stats.users_with_photos, color: '#34D399' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)' }}>
                <span style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>{label}</span>
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', fontWeight: 700, color }}>{value ?? 0}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
