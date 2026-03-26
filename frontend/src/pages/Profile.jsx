import { useState, useEffect } from 'react';
import { Camera, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../components/AuthContext';

const NEPAL_DISTRICTS = [
  'Kathmandu','Lalitpur','Bhaktapur','Pokhara','Chitwan','Butwal','Dharan','Biratnagar',
  'Birgunj','Hetauda','Itahari','Janakpur','Nepalgunj','Dhangadhi','Mahendranagar',
  'Syangja','Palpa','Baglung','Solukhumbu','Ilam','Jhapa','Morang','Sunsari',
  'Saptari','Siraha','Dhanusa','Mahottari','Sarlahi','Rautahat','Bara','Parsa',
  'Nawalpur','Rupandehi','Kapilvastu','Gulmi','Parbat','Kaski','Lamjung','Tanahu',
  'Gorkha','Dhading','Nuwakot','Rasuwa','Sindhupalchok','Kavrepalanchok','Dolakha',
  'Ramechhap','Sindhuli','Makwanpur','Okhaldhunga','Khotang','Udayapur','Bhojpur',
  'Sankhuwasabha','Terhathum','Panchthar','Rolpa','Rukum','Salyan','Dang','Banke',
  'Bardiya','Surkhet','Dailekh','Jajarkot','Dolpa','Humla','Jumla','Kalikot',
  'Achham','Bajura','Bajhang','Doti','Kailali','Kanchanpur'
];

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.get('/profile/me').then(res => setForm(res.data)).catch(() => toast.error('Failed to load profile'));
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
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

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = new FormData();
    data.append('photo', file);
    setUploading(true);
    try {
      const res = await api.post('/profile/me/photo', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(f => ({ ...f, profile_pic: res.data.profile_pic }));
      await refreshUser();
      toast.success('Photo updated! 📸');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  if (!form) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading profile…</div>;

  return (
    <div className="page">
      <div className="app-container" style={{ maxWidth: 680 }}>
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Keep your profile up to date</p>

        {/* Photo section */}
        <div className="card" style={{ padding: 28, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ position: 'relative' }}>
            {form.profile_pic
              ? <img src={form.profile_pic} alt="Profile" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--crimson)' }} />
              : <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, #FDE8EC, #FAF0E6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.8rem', border: '3px solid var(--border)' }}>
                  {form.gender === 'female' ? '👩' : form.gender === 'male' ? '👨' : '🧑'}
                </div>
            }
            <label style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--crimson)', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
              <Camera size={15} />
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
            </label>
          </div>
          <div>
            <h3 style={{ marginBottom: 4 }}>{form.name}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Member since {new Date(form.created_at).toLocaleDateString()}</p>
            {uploading && <p style={{ color: 'var(--crimson)', fontSize: '0.82rem', marginTop: 4 }}>Uploading…</p>}
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 6 }}>Max 5MB · JPG, PNG, WebP</p>
          </div>
        </div>

        {/* Form */}
        <div className="card" style={{ padding: 28 }}>
          <h3 style={{ marginBottom: 20 }}>Edit Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.name || ''} onChange={e => set('name', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
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
            <label className="form-label">Location</label>
            <select className="form-select" value={form.location || ''} onChange={e => set('location', e.target.value)}>
              <option value="">Select District</option>
              {NEPAL_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
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

          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={16} /> {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
