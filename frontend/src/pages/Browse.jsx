import { useState, useEffect } from 'react';
import { MapPin, Briefcase, Heart, Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

function PhotoCarousel({ photos, profilePic, gender }) {
  const [idx, setIdx] = useState(0);
  const imgs = photos?.length > 0 ? photos.map(p => p.photo_url) : profilePic ? [profilePic] : [];

  if (!imgs.length) return (
    <div className="profile-card-placeholder">
      {gender === 'female' ? '👩' : gender === 'male' ? '👨' : '🧑'}
    </div>
  );

  return (
    <div style={{ position: 'relative', height: 300, overflow: 'hidden', background: 'var(--surface)' }}>
      <img src={imgs[idx]} alt="" className="profile-card-img" style={{ height: 300 }} />

      {imgs.length > 1 && (
        <>
          {/* Dot indicators at top */}
          <div style={{ position: 'absolute', top: 10, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 4 }}>
            {imgs.map((_, i) => (
              <div key={i} style={{ height: 3, width: i === idx ? 20 : 6, borderRadius: 3, background: i === idx ? 'var(--gold)' : 'rgba(255,255,255,0.4)', transition: 'all 0.25s', cursor: 'pointer' }} onClick={e => { e.stopPropagation(); setIdx(i); }} />
            ))}
          </div>
          {/* Nav buttons */}
          <button onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + imgs.length) % imgs.length); }}
            style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', backdropFilter: 'blur(4px)' }}>
            <ChevronLeft size={16} />
          </button>
          <button onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % imgs.length); }}
            style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', backdropFilter: 'blur(4px)' }}>
            <ChevronRight size={16} />
          </button>
          {/* Counter */}
          <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '0.7rem', padding: '2px 8px', borderRadius: 20, fontWeight: 600, backdropFilter: 'blur(4px)' }}>
            {idx + 1}/{imgs.length}
          </div>
        </>
      )}
    </div>
  );
}

function ProfileCard({ profile, onRequest }) {
  const [modal, setModal] = useState(false);
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    setLoading(true);
    try {
      await onRequest(profile.id, msg);
      setSent(true);
      setModal(false);
      toast.success(`Request sent to ${profile.name}!`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally { setLoading(false); }
  };

  return (
    <>
      <div className="profile-card fade-up">
        <PhotoCarousel photos={profile.photos} profilePic={profile.profile_pic} gender={profile.gender} />

        {/* Gradient overlay bottom */}
        <div style={{ position: 'relative' }}>
          <div style={{ padding: '20px 20px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <div className="profile-card-name">{profile.name}, {profile.age}</div>
              {profile.photos?.length > 0 && (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: 6 }}>{profile.photos.length} photos</span>
              )}
            </div>

            <div className="profile-card-meta">
              {profile.job_title && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Briefcase size={11} />{profile.job_title}</span>}
              {profile.location && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} />{profile.location}</span>}
            </div>

            {profile.bio && <p className="profile-card-bio">{profile.bio}</p>}

            {profile.looking_for && (
              <div style={{ marginBottom: 14 }}>
                <span className="chip"><Heart size={10} /> {profile.looking_for.substring(0, 35)}{profile.looking_for.length > 35 ? '…' : ''}</span>
              </div>
            )}

            {sent
              ? <div style={{ textAlign: 'center', padding: '10px', color: 'var(--text-3)', fontSize: '0.85rem', border: '1px solid var(--border)', borderRadius: 8 }}>✓ Request Sent</div>
              : <button className="btn btn-gold btn-full" onClick={() => setModal(true)}><Heart size={14} /> Connect</button>
            }
          </div>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <h3 className="modal-title">Connect with {profile.name}</h3>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 4 }}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', gap: 16, alignItems: 'center', padding: 16, background: 'var(--surface)', borderRadius: 12, marginBottom: 20 }}>
              {profile.profile_pic
                ? <img src={profile.profile_pic} alt="" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }} />
                : <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>{profile.gender === 'female' ? '👩' : '👨'}</div>
              }
              <div>
                <div style={{ fontWeight: 600 }}>{profile.name}, {profile.age}</div>
                {profile.location && <div style={{ color: 'var(--text-2)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}><MapPin size={11} />{profile.location}</div>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Personal Message <span style={{ color: 'var(--text-3)', textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>(optional but recommended)</span></label>
              <textarea className="form-textarea" placeholder={`Hi ${profile.name}, I came across your profile and really liked what I read. I'd love to connect and get to know you better...`} value={msg} onChange={e => setMsg(e.target.value)} rows={4} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-gold btn-full" onClick={send} disabled={loading}>{loading ? 'Sending...' : '✦ Send Request'}</button>
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

  const fetch_ = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.location) params.location = filters.location;
      if (filters.min_age) params.min_age = filters.min_age;
      if (filters.max_age) params.max_age = filters.max_age;
      if (filters.gender) params.gender = filters.gender;
      const res = await api.get('/browse', { params });
      setProfiles(res.data);
    } catch { toast.error('Failed to load profiles'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch_(); }, []);

  const setF = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Discover</h1>
          <p className="page-subtitle">Find someone worth getting to know</p>
        </div>

        <div className="filter-bar">
          <div className="form-group">
            <label className="form-label">Location</label>
            <input className="form-input" placeholder="City, Country…" value={filters.location} onChange={e => setF('location', e.target.value)} onKeyDown={e => e.key === 'Enter' && fetch_()} />
          </div>
          <div className="form-group">
            <label className="form-label">Min Age</label>
            <input className="form-input" type="number" min="18" max="80" placeholder="18" value={filters.min_age} onChange={e => setF('min_age', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Max Age</label>
            <input className="form-input" type="number" min="18" max="80" placeholder="60" value={filters.max_age} onChange={e => setF('max_age', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Gender</label>
            <select className="form-select" value={filters.gender} onChange={e => setF('gender', e.target.value)}>
              <option value="">Everyone</option>
              <option value="male">Men</option>
              <option value="female">Women</option>
              <option value="other">Other</option>
            </select>
          </div>
          <button className="btn btn-gold" onClick={fetch_} style={{ alignSelf: 'flex-end', height: 44 }}><Search size={15} /> Search</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-3)' }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>✦</div>
            Loading profiles…
          </div>
        ) : profiles.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🔍</div>
            <h3>No profiles found</h3>
            <p>Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text-3)', fontSize: '0.82rem', marginBottom: 20 }}>{profiles.length} profile{profiles.length !== 1 ? 's' : ''} found</p>
            <div className="profiles-grid">
              {profiles.map(p => <ProfileCard key={p.id} profile={p} onRequest={(id, msg) => api.post(`/connections/request/${id}`, { message: msg })} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
