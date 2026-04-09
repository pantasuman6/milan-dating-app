import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../components/AuthContext';
import { X, Upload } from 'lucide-react';
import api from '../api';

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [photos, setPhotos] = useState([]);
  const [form, setForm] = useState({
    email: '', password: '', name: '', age: '', gender: '',
    job_title: '', bio: '', location: '', looking_for: '', match_gender_pref: 'any'
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleEmailChange = (e) => {
    const val = e.target.value;
    set('email', val);
    if (val && !validateEmail(val)) {
      setEmailError('⚠️ Invalid email — use format: name@example.com');
    } else {
      setEmailError('');
    }
  };

  const handlePhotoAdd = (e) => {
    const files = Array.from(e.target.files);
    const remaining = 5 - photos.length;
    const toAdd = files.slice(0, remaining).map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setPhotos(p => [...p, ...toAdd]);
    e.target.value = '';
  };

  const removePhoto = (index) => {
    setPhotos(p => {
      URL.revokeObjectURL(p[index].preview);
      return p.filter((_, i) => i !== index);
    });
  };

  const nextStep = () => {
    if (step === 1) {
      if (!form.name || !form.email || !form.password) return toast.error('Please fill all required fields');
      if (!validateEmail(form.email)) return toast.error('Please enter a valid email address');
      if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    }
    if (step === 2) {
      if (!form.age || !form.gender) return toast.error('Age and gender are required');
      if (parseInt(form.age) < 18) return toast.error('You must be 18 or older');
    }
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (!form.bio) return toast.error('Please write a short bio');
    if (photos.length < 2) return toast.error('Please upload at least 2 photos');

    setLoading(true);

    // ── Step 1: Register user (separate try/catch so errors show correctly) ──
    try {
      await register(form);
    } catch (err) {
      // This is the REAL registration error (email taken, server down, etc.)
      toast.error(err.response?.data?.error || 'Registration failed — please try again');
      setLoading(false);
      return; // stop here, don't proceed to photo upload
    }

    // ── Step 2: Upload photos (separate — never blocks registration success) ──
    try {
      const formData = new FormData();
      photos.forEach(p => formData.append('photos', p.file));
      await api.post('/profile/me/photos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (err) {
      // Photo upload failed but registration succeeded — still go to browse
      // User can add photos later from their Profile page
      console.error('Photo upload error:', err);
      toast('Account created! You can add photos from your Profile page.', { icon: '📸' });
    }

    setLoading(false);
    toast.success('Welcome to Milan! 🌸');
    navigate('/browse');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #FDF0F2, #FDF8F0)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: '2rem', color: 'var(--crimson)' }}>मिलन Milan</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Create your profile — Step {step} of 3</p>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 12 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ width: 40, height: 4, borderRadius: 2, background: i <= step ? 'var(--crimson)' : 'var(--border)', transition: 'background 0.3s' }} />
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 32 }}>

          {/* STEP 1 */}
          {step === 1 && (
            <div className="fade-in">
              <h2 style={{ marginBottom: 6 }}>Account Details</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 24 }}>Your login credentials</p>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" placeholder="Your full name" value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleEmailChange}
                  style={{ borderColor: emailError ? 'var(--crimson)' : undefined }}
                />
                {emailError && <p style={{ color: 'var(--crimson)', fontSize: '0.78rem', marginTop: 5 }}>{emailError}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input className="form-input" type="password" placeholder="Min. 6 characters" value={form.password} onChange={e => set('password', e.target.value)} />
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="fade-in">
              <h2 style={{ marginBottom: 6 }}>About You</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 24 }}>Basic profile information</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Age *</label>
                  <input className="form-input" type="number" min="18" max="80" placeholder="Age" value={form.age} onChange={e => set('age', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender *</label>
                  <select className="form-select" value={form.gender} onChange={e => set('gender', e.target.value)}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Job Title</label>
                <input className="form-input" placeholder="e.g. Software Engineer, Teacher, Doctor" value={form.job_title} onChange={e => set('job_title', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Your Location</label>
                <input
                  className="form-input"
                  placeholder="e.g. Kathmandu, Nepal  |  London, UK  |  New York, USA"
                  value={form.location}
                  onChange={e => set('location', e.target.value)}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Type your city and country — anywhere in the world</p>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="fade-in">
              <h2 style={{ marginBottom: 6 }}>Your Story & Photos</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>Help people get to know you</p>

              <div className="form-group">
                <label className="form-label">
                  Photos * <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(min 2, max 5)</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 8 }}>
                  {photos.map((p, i) => (
                    <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 10, overflow: 'hidden', border: i === 0 ? '2px solid var(--crimson)' : '2px solid var(--border)' }}>
                      <img src={p.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {i === 0 && (
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(196,30,58,0.85)', color: 'white', fontSize: '0.68rem', textAlign: 'center', padding: '2px 0', fontWeight: 600 }}>
                          Main Photo
                        </div>
                      )}
                      <button onClick={() => removePhoto(i)} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {photos.length < 5 && (
                    <label style={{ aspectRatio: '1', border: '2px dashed var(--border)', borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.72rem', gap: 4, background: '#FAFAFA' }}>
                      <Upload size={20} />
                      Add Photo
                      <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePhotoAdd} />
                    </label>
                  )}
                </div>
                {photos.length < 2 && (
                  <p style={{ color: 'var(--crimson)', fontSize: '0.78rem' }}>⚠️ Please upload at least 2 photos</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">About Me *</label>
                <textarea className="form-textarea" placeholder="Tell potential matches about yourself..." value={form.bio} onChange={e => set('bio', e.target.value)} rows={3} />
              </div>
              <div className="form-group">
                <label className="form-label">Looking For</label>
                <textarea className="form-textarea" placeholder="Describe your ideal match..." value={form.looking_for} onChange={e => set('looking_for', e.target.value)} rows={3} />
              </div>
              <div className="form-group">
                <label className="form-label">Interested In</label>
                <select className="form-select" value={form.match_gender_pref} onChange={e => set('match_gender_pref', e.target.value)}>
                  <option value="any">Everyone</option>
                  <option value="male">Men</option>
                  <option value="female">Women</option>
                </select>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            {step > 1 && <button className="btn btn-ghost" onClick={() => setStep(s => s - 1)}>Back</button>}
            {step < 3
              ? <button className="btn btn-primary btn-full" onClick={nextStep} disabled={step === 1 && !!emailError}>Continue →</button>
              : <button className="btn btn-primary btn-full" onClick={handleSubmit} disabled={loading || photos.length < 2}>{loading ? 'Creating Profile...' : '🌸 Create My Profile'}</button>
            }
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--crimson)', fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
