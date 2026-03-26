import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/connections/matches')
      .then(res => setMatches(res.data))
      .catch(() => toast.error('Failed to load matches'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="app-container">
        <h1 className="page-title">Your Matches 💕</h1>
        <p className="page-subtitle">People who accepted your connection or vice versa</p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading…</div>
        ) : matches.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💞</div>
            <h3>No matches yet</h3>
            <p>Start discovering profiles and sending connection requests</p>
            <Link to="/browse" className="btn btn-primary" style={{ marginTop: 16 }}>Discover People</Link>
          </div>
        ) : (
          <div className="profiles-grid">
            {matches.map(m => (
              <div key={m.id} className="profile-card fade-in">
                {m.profile_pic
                  ? <img className="profile-card-image" src={m.profile_pic} alt={m.name} />
                  : <div className="profile-card-avatar">{m.gender === 'female' ? '👩' : '👨'}</div>
                }
                <div className="profile-card-body">
                  <div className="profile-card-name">{m.name}, {m.age}</div>
                  <div className="profile-card-meta">
                    {m.job_title && <span><Briefcase size={12} style={{ marginRight: 3 }} />{m.job_title}</span>}
                    {m.location && <span style={{ marginLeft: 8 }}><MapPin size={12} style={{ marginRight: 3 }} />{m.location}</span>}
                  </div>
                  {m.bio && <p className="profile-card-bio">{m.bio}</p>}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Connected {new Date(m.connected_at).toLocaleDateString()}</span>
                    <Link to={`/messages/${m.id}`} className="btn btn-primary btn-sm">
                      <MessageCircle size={13} /> Chat
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
