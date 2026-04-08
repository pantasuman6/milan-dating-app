import { useState, useEffect } from 'react';
import { Save, X, Upload, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../components/AuthContext';

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function Profile() {
  const { refreshUser } = useAuth();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    api.get('/profile/me').then(res => {
      setForm(res.data);
      setPhotos(res.data.photos || []);
    }).catch(() => toast.error('Failed to load profile'));
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (emailError) return toast.error('Fix the email address first');
    setSaving(true);
    try {
      await api.put('/profile/me', form);
      await refreshUser();
      toast.success('Profile updated! ✅');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleAddPhotos = async (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 5) return toast.error('Maximum 5 photos allowed');
    const formData = new FormData();
    files.forEach(f => formData.append('photos', f));
    setUploading(true);
    try {
      const token = localStorage.getItem('milan_token');
      const res = await fetch('/api/profile/me/photos', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`${files.length} photo(s) uploaded! 📸`);
      const updated = await api.get('/profile/me');
      setPhotos(updated.data.photos || []);
      await refreshUser();
    } catch (err) {
      toast.error(err.message || 'Failed to upload photos');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeletePhoto = async (photoId) => {
    try {
      await api.delete(`/profile/me/photos/${photoId}`);
      toast.success('Photo removed');
      const updated = await api.get('/profile/me');
      setPhotos(updated.data.photos || []);
      await refreshUser();
    } catch {
      toast.error('Failed to delete photo');
    }
  };

  if (!form) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading profile…</div>;

  return (
    <div className="page">
      <div className="app-container" style={{ maxWidth: 680 }}>
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Keep your profile up to date</p>

        {/* Photos */}
        <div className="card" style={{ padding: 28, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ marginBottom: 2 }}>My Photos</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{photos.length}/5 photos · Min 2 recommended</p>
            </div>
            {photos.length < 5 && (
              <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
                <Upload size={14} /> Add Photos
                <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleAddPhotos} disabled={uploading} />
              </label>
            )}
          </div>

          {photos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', border: '2px dashed var(--border)', borderRadius: 12 }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>📷</div>
              <p style={{ fontSize: '0.85rem' }}>No photos yet — add at least 2 to attract matches</p>
              <label className="btn btn-primary btn-sm" style={{ marginTop: 12, cursor: 'pointer' }}>
                <Upload size={14} /> Upload Photos
                <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleAddPhotos} />
              </label>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 10 }}>
              {photos.map((photo) => (
                <div key={photo.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: 10, overflow: 'hidden', border: photo.is_primary ? '3px solid var(--crimson)' : '2px solid var(--border)' }}>
                  <img src={photo.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {photo.is_primary && (
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(196,30,58,0.85)', color: 'white', fontSize: '0.68rem', textAlign: 'center', padding: '3px 0', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                      <Star size={10} /> Main
                    </div>
                  )}
                  <button onClick={() => handleDeletePhoto(photo.id)}
                    style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.65)', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                    <X size={13} />
                  </button>
                </div>
              ))}
              {photos.length < 5 && (
                <label style={{ aspectRatio: '1', border: '2px dashed var(--border)', borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.72rem', gap: 4 }}>
                  <Upload size={18} /> Add
                  <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleAddPhotos} />
                </label>
              )}
            </div>
          )}
          {uploading && <p style={{ color: 'var(--crimson)', fontSize: '0.82rem', marginTop: 10 }}>Uploading…</p>}
        </div>

        {/* Details */}
        <div className="card" style={{ padding: 28 }}>
          <h3 style={{ marginBottom: 20 }}>Edit Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.name || ''} onChange={e => set('name', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Email (cannot change)</label>
              <input className="form-input" value={form.email || ''} disabled style={{ opacity: 0.6 }} />
            </div>
            <div className="form-group">
              <label className="form-label">Age</label>
              <input className="form-input" type="number" min="18" max="80" value={form.age || ''} onChange={e => set('age', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="form-select" value={form.gender || ''} onChange={e => set('gender', e.target.value)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Job Title</label>
            <input className="form-input" placeholder="e.g. Software Engineer, Doctor, Teacher" value={form.job_title || ''} onChange={e => set('job_title', e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Your Location</label>
            <input
              className="form-input"
              placeholder="e.g. Kathmandu, Nepal  |  London, UK  |  Sydney, Australia"
              value={form.location || ''}
              onChange={e => set('location', e.target.value)}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Type your city and country — anywhere in the world</p>
          </div>

          <div className="form-group">
            <label className="form-label">About Me</label>
            <textarea className="form-textarea" placeholder="Tell people about yourself…" value={form.bio || ''} onChange={e => set('bio', e.target.value)} rows={4} />
          </div>

          <div className="form-group">
            <label className="form-label">Looking For</label>
            <textarea className="form-textarea" placeholder="Describe your ideal match and relationship…" value={form.looking_for || ''} onChange={e => set('looking_for', e.target.value)} rows={3} />
          </div>

          <div className="form-group">
            <label className="form-label">Interested In</label>
            <select className="form-select" value={form.match_gender_pref || 'any'} onChange={e => set('match_gender_pref', e.target.value)}>
              <option value="any">Everyone</option>
              <option value="male">Men</option>
              <option value="female">Women</option>
            </select>
          </div>

          <button className="btn btn-primary" onClick={handleSave} disabled={saving || !!emailError}>
            <Save size={16} /> {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
