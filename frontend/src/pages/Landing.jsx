import { Link } from 'react-router-dom';
import { Heart, Shield, Users, MapPin } from 'lucide-react';

export default function Landing() {
  return (
    <div>
      <nav className="navbar">
        <div className="app-container navbar-inner">
          <span className="brand">मिलन <span>Milan</span></span>
          <div className="nav-links">
            <Link to="/login" className="nav-link">Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Join Free</Link>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="app-container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 600 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#FFF0F3', color: 'var(--crimson)', padding: '6px 16px', borderRadius: 20, fontSize: '0.85rem', fontWeight: 600, marginBottom: 24 }}>
              🌏 Nepali Dating App — Worldwide
            </div>
            <h1 style={{ fontSize: '3.4rem', lineHeight: 1.15, marginBottom: 20, color: 'var(--charcoal)' }}>
              Find Your <span style={{ color: 'var(--crimson)', fontStyle: 'italic' }}>साथी</span><br />
              The Meaningful Way
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: 36, lineHeight: 1.7 }}>
              No endless swiping. Milan is built for Nepalis worldwide — send a heartfelt request, build a friendship first, and let love grow naturally.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary" style={{ fontSize: '1rem', padding: '13px 28px' }}>
                <Heart size={18} /> Create Your Profile
              </Link>
              <Link to="/login" className="btn btn-outline" style={{ fontSize: '1rem', padding: '13px 28px' }}>
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 0', background: 'white' }}>
        <div className="app-container">
          <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: 8 }}>Why Milan is Different</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 48 }}>Designed with Nepali values at heart</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 28 }}>
            {[
              { icon: <Heart size={28} />, title: 'No Swiping', desc: 'Send a thoughtful connection request with a personal message. Quality over quantity.' },
              { icon: <Users size={28} />, title: 'Friendship First', desc: 'Start as friends. Get to know each other before taking the next step.' },
              { icon: <Shield size={28} />, title: 'Safe & Private', desc: 'Your profile is only visible to verified users. Your safety is our priority.' },
              { icon: <MapPin size={28} />, title: 'Worldwide', desc: 'Connect with Nepalis across the globe — Nepal, USA, UK, Australia and beyond.' },
            ].map((f, i) => (
              <div key={i} className="card" style={{ padding: 28, textAlign: 'center' }}>
                <div style={{ color: 'var(--crimson)', marginBottom: 14, display: 'flex', justifyContent: 'center' }}>{f.icon}</div>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer style={{ padding: '32px 0', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <div className="app-container">
          <p>मिलन Milan © 2026 — Made with ❤️ for Nepal 🇳🇵</p>
        </div>
      </footer>
    </div>
  );
}
