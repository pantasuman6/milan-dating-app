import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../components/AuthContext';

const NEPAL_DISTRICTS = [
  'Kathmandu','Lalitpur','Bhaktapur','Pokhara','Chitwan','Butwal','Dharan','Biratnagar',
  'Birgunj','Hetauda','Itahari','Janakpur','Nepalgunj','Dhangadhi','Mahendranagar',
  'Syangja','Palpa','Baglung','Mustang','Manang','Solukhumbu','Taplejung','Ilam',
  'Jhapa','Morang','Sunsari','Saptari','Siraha','Dhanusa','Mahottari','Sarlahi',
  'Rautahat','Bara','Parsa','Nawalpur','Rupandehi','Kapilvastu','Arghakhanchi',
  'Gulmi','Parbat','Kaski','Lamjung','Tanahu','Gorkha','Dhading','Nuwakot',
  'Rasuwa','Sindhupalchok','Kavrepalanchok','Dolakha','Ramechhap','Sindhuli',
  'Makwanpur','Okhaldhunga','Khotang','Udayapur','Bhojpur','Sankhuwasabha',
  'Terhathum','Panchthar','Rolpa','Rukum','Salyan','Dang','Banke','Bardiya',
  'Surkhet','Dailekh','Jajarkot','Dolpa','Mugu','Humla','Jumla','Kalikot',
  'Achham','Bajura','Bajhang','Doti','Kailali','Kanchanpur'
];

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '', password: '', name: '', age: '', gender: '',
    job_title: '', bio: '', location: '', looking_for: '', match_gender_pref: 'any'
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const nextStep = () => {
    if (step === 1) {
      if (!form.email || !form.password || !form.name) return toast.error('Please fill all required fields');
      if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    }
    if (step === 2) {
      if (!form.age || !form.gender) return toast.error('Age and gender are required');
      if (form.age < 18) return toast.error('You must be 18 or older');
    }
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (!form.bio) return toast.error('Please write a short bio');
    setLoading(true);
    try {
      await register(form);
      toast.success('Welcome to Milan! 🌸');
      navigate('/browse');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
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
                <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input className="form-input" type="password" placeholder="Min. 6 characters" value={form.password} onChange={e => set('password', e.target.value)} />
              </div>
            </div>
          )}

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
                <label className="form-label">Location</label>
                <select className="form-select" value={form.location} onChange={e => set('location', e.target.value)}>
                  <option value="">Select District</option>
                  {NEPAL_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="fade-in">
              <h2 style={{ marginBottom: 6 }}>Your Story</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 24 }}>Help people get to know you</p>
              <div className="form-group">
                <label className="form-label">About Me *</label>
                <textarea className="form-textarea" placeholder="Tell potential matches about yourself — your interests, values, what makes you unique..." value={form.bio} onChange={e => set('bio', e.target.value)} rows={4} />
              </div>
              <div className="form-group">
                <label className="form-label">Looking For</label>
                <textarea className="form-textarea" placeholder="Describe your ideal match — personality, values, what kind of relationship you're looking for..." value={form.looking_for} onChange={e => set('looking_for', e.target.value)} rows={3} />
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
              ? <button className="btn btn-primary btn-full" onClick={nextStep}>Continue →</button>
              : <button className="btn btn-primary btn-full" onClick={handleSubmit} disabled={loading}>{loading ? 'Creating Profile...' : '🌸 Create My Profile'}</button>
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
