import { useState, useEffect } from 'react';
import { MapPin, Briefcase, Heart, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

function PhotoCarousel({ photos, profilePic, gender }) {
  const [idx, setIdx] = useState(0);
  const allPhotos = photos?.length > 0 ? photos.map(p => p.photo_url) : (profilePic ? [profilePic] : []);

  if (allPhotos.length === 0) {
    return (
      <div className="profile-card-avatar">
        {gender === 'female' ? '👩' : gender === 'male' ? '👨' : '🧑'}
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: 220 }}>
      <img
        src={allPhotos[idx]}
        alt=""
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      {allPhotos.length > 1 && (
        <>
          <button
            onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + allPhotos.length) % allPhotos.length); }}
            style={{ position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.45)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
          ><ChevronLeft size={16} /></button>
          <button
            onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % allPhotos.length); }}
            style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.45)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
          ><ChevronRight size={16} /></button>
          <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 5 }}>
            {allPhotos.map((_, i) => (
              <div key={i} style={{ width: i === idx ? 16 : 6, height: 6, borderRadius: 3, background: i === idx ? 'white' : 'rgba(255,255,255,0.5)', transition: 'all 0.2s', cursor: 'pointer' }} onClick={e => { e.stopPropagation(); setIdx(i); }} />
            ))}
          </div>
        </>
      )}
      {allPhotos.length > 1 && (
        <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '0.72rem', padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>
          {idx + 1}/{allPhotos.length}
        </div>
      )}
    </div>
  );
}

function ProfileCard({ profile, onRequest }) {
  const [modal, setModal] = useState(false);
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendRequest = async () => {
    setLoading(true);
    try {
      await onRequest(profile.id, msg);
      setSent(true);
      setModal(false);
      toast.success(`Connection request sent to ${profile.name}! 🌸`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="profile-card fade-in">
        <PhotoCarousel photos={profile.photos} profilePic={profile.profile_pic} gender={profile.gender} />
        <div className="profile-card-body">
          <div className="profile-card-name">{profile.name}, {profile.age}</div>
          <div className="profile-card-meta">
            {profile.job_title && <span><Briefcase size={12} style={{ marginRight: 3 }} />{profile.job_title}</span>}
            {profile.location && <span style={{ marginLeft: 8 }}><MapPin size={12} style={{ marginRight: 3 }} />{profile.location}</span>}
          </div>
          {profile.bio && <p className="profile-card-bio">{profile.bio}</p>}
          {profile.looking_for && (
            <div className="profile-card-tags">
              <span className="tag">💭 {profile.looking_for.substring(0, 40)}{profile.looking_for.length > 40 ? '…' : ''}</span>
            </div>
          )}
          {sent
            ? <span className="btn btn-ghost btn-sm btn-full" style={{ justifyContent: 'center', cursor: 'default' }}>✓ Request Sent</span>
            : <button className="btn btn-primary btn-sm btn-full" onClick={() => setModal(true)}>
                <Heart size={14} /> Connect
              </button>
          }
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Connect with {profile.name}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 20 }}>Send a warm introduction!</p>
            {profile.profile_pic
              ? <img src={profile.profile_pic} alt="" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', marginBottom: 12 }} />
              : <div style={{ fontSize: '3rem', marginBottom: 12 }}>{profile.gender === 'female' ? '👩' : '👨'}</div>
            }
            <p style={{ fontWeight: 600, marginBottom: 2 }}>{profile.name}, {profile.age}</p>
            {profile.location && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}><MapPin size={12} style={{ marginRight: 3 }} />{profile.location}</p>}
            <div className="form-group">
              <label className="form-label">Your Message (optional)</label>
              <textarea
                className="form-textarea"
                placeholder={`Hi ${profile.name}! I came across your profile and would love to connect…`}
                value={msg}
                onChange={e => setMsg(e.target.value)}
                rows={3}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary btn-full" onClick={sendRequest} disabled={loading}>
                {loading ? 'Sending...' : '🌸 Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function Browse() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ location: '', min_age: '', max_age: '', gender: '' });

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.location) params.location = filters.location;
      if (filters.min_age) params.min_age = filters.min_age;
      if (filters.max_age) params.max_age = filters.max_age;
      if (filters.gender) params.gender = filters.gender;
      const res = await api.get('/browse', { params });
      setProfiles(res.data);
    } catch {
      toast.error('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfiles(); }, []);

  const sendRequest = async (receiverId, message) => {
    await api.post(`/connections/request/${receiverId}`, { message });
  };

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  return (
    <div className="page">
      <div className="app-container">
        <h1 className="page-title">Discover People</h1>
        <p className="page-subtitle">Find your साथी anywhere in the world</p>

        <div className="filter-bar">
          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              className="form-input"
              placeholder="e.g. London, Kathmandu, New York…"
              value={filters.location}
              onChange={e => setFilter('location', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchProfiles()}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Min Age</label>
            <input className="form-input" type="number" min="18" max="80" placeholder="18" value={filters.min_age} onChange={e => setFilter('min_age', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Max Age</label>
            <input className="form-input" type="number" min="18" max="80" placeholder="60" value={filters.max_age} onChange={e => setFilter('max_age', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Gender</label>
            <select className="form-select" value={filters.gender} onChange={e => setFilter('gender', e.target.value)}>
              <option value="">All</option>
              <option value="male">Men</option>
              <option value="female">Women</option>
              <option value="other">Other</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={fetchProfiles} style={{ alignSelf: 'flex-end', height: 44 }}>
            <Search size={16} /> Search
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Loading profiles…</div>
        ) : profiles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No profiles found</h3>
            <p>Try adjusting your filters or check back later</p>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>{profiles.length} profile{profiles.length !== 1 ? 's' : ''} found</p>
            <div className="profiles-grid">
              {profiles.map(p => <ProfileCard key={p.id} profile={p} onRequest={sendRequest} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
