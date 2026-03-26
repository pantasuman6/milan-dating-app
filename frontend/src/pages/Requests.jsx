import { useState, useEffect } from 'react';
import { MapPin, Briefcase, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

function Avatar({ profile, size = 60 }) {
  if (profile.profile_pic) {
    return <img src={profile.profile_pic} alt={profile.name} className="request-avatar" style={{ width: size, height: size }} />;
  }
  return (
    <div className="request-avatar-placeholder" style={{ width: size, height: size }}>
      {profile.gender === 'female' ? '👩' : profile.gender === 'male' ? '👨' : '🧑'}
    </div>
  );
}

export default function Requests() {
  const [tab, setTab] = useState('incoming');
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [inc, out] = await Promise.all([
        api.get('/connections/incoming'),
        api.get('/connections/outgoing'),
      ]);
      setIncoming(inc.data);
      setOutgoing(out.data);
    } catch {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const respond = async (requestId, action) => {
    try {
      await api.put(`/connections/request/${requestId}`, { action });
      toast.success(action === 'accepted' ? '🎉 Connection accepted!' : 'Request declined');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to respond');
    }
  };

  const cancel = async (requestId) => {
    try {
      await api.delete(`/connections/request/${requestId}`);
      toast.success('Request cancelled');
      fetchAll();
    } catch {
      toast.error('Failed to cancel');
    }
  };

  const TabBtn = ({ id, label, count }) => (
    <button
      onClick={() => setTab(id)}
      style={{
        padding: '10px 24px', border: 'none', borderRadius: 10, fontFamily: 'DM Sans, sans-serif',
        fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s',
        background: tab === id ? 'var(--crimson)' : 'transparent',
        color: tab === id ? 'white' : 'var(--text-muted)',
      }}
    >
      {label} {count > 0 && <span style={{ marginLeft: 4, background: tab === id ? 'rgba(255,255,255,0.3)' : 'var(--border)', borderRadius: 20, padding: '1px 8px', fontSize: '0.78rem' }}>{count}</span>}
    </button>
  );

  return (
    <div className="page">
      <div className="app-container">
        <h1 className="page-title">Connection Requests</h1>
        <p className="page-subtitle">Manage who wants to connect with you</p>

        <div style={{ display: 'flex', gap: 4, background: 'var(--card-bg)', padding: 6, borderRadius: 12, border: '1px solid var(--border)', width: 'fit-content', marginBottom: 28 }}>
          <TabBtn id="incoming" label="Incoming" count={incoming.filter(r => r.status === 'pending').length} />
          <TabBtn id="outgoing" label="Sent" count={outgoing.length} />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading…</div>
        ) : tab === 'incoming' ? (
          incoming.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <h3>No incoming requests</h3>
              <p>When someone wants to connect, they'll appear here</p>
            </div>
          ) : (
            incoming.map(req => (
              <div key={req.id} className="request-card fade-in">
                <Avatar profile={req} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <strong style={{ fontSize: '1rem' }}>{req.name}</strong>
                      <span style={{ color: 'var(--text-muted)', marginLeft: 8, fontSize: '0.88rem' }}>{req.age} yrs</span>
                    </div>
                    <span className={`status-${req.status}`}>{req.status}</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '4px 0 8px' }}>
                    {req.job_title && <span><Briefcase size={11} style={{ marginRight: 3 }} />{req.job_title}</span>}
                    {req.location && <span style={{ marginLeft: 8 }}><MapPin size={11} style={{ marginRight: 3 }} />{req.location}</span>}
                  </div>
                  {req.message && (
                    <div style={{ background: '#FFF8F9', border: '1px solid #FDE0E5', borderRadius: 8, padding: '8px 12px', fontSize: '0.85rem', color: '#555', marginBottom: 10, fontStyle: 'italic' }}>
                      "{req.message}"
                    </div>
                  )}
                  {req.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-success btn-sm" onClick={() => respond(req.id, 'accepted')}><Check size={14} /> Accept</button>
                      <button className="btn btn-danger btn-sm" onClick={() => respond(req.id, 'rejected')}><X size={14} /> Decline</button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )
        ) : (
          outgoing.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">💌</div>
              <h3>No sent requests</h3>
              <p>Discover profiles and send your first connection request</p>
            </div>
          ) : (
            outgoing.map(req => (
              <div key={req.id} className="request-card fade-in">
                <Avatar profile={{ profile_pic: req.profile_pic, gender: req.gender }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                    <strong>{req.name}</strong>
                    <span className={`status-${req.status}`}>{req.status}</span>
                  </div>
                  {req.location && <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '4px 0 8px' }}><MapPin size={11} style={{ marginRight: 3 }} />{req.location}</p>}
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Sent {new Date(req.created_at).toLocaleDateString()}</p>
                  {req.status === 'pending' && (
                    <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={() => cancel(req.id)}>Cancel Request</button>
                  )}
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}
