import { Link } from 'react-router-dom';
import { Heart, Sparkles, Shield, Globe } from 'lucide-react';

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>

      {/* Ambient background glows */}
      <div style={{ position: 'fixed', top: '-20%', right: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,168,83,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-20%', left: '-10%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,99,122,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Nav */}
      <nav style={{ position: 'relative', zIndex: 10, padding: '24px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="brand" style={{ fontSize: '1.8rem' }}>मिलन</span>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link to="/login" style={{ color: 'var(--text-2)', fontSize: '0.9rem', fontWeight: 500, padding: '8px 16px', borderRadius: 8, transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = 'var(--text)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-2)'}
            >Sign In</Link>
            <Link to="/register" className="btn btn-gold btn-sm">Join Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: 'relative', zIndex: 1, padding: '100px 0 80px' }}>
        <div className="container">
          <div style={{ maxWidth: 700 }}>
            {/* Eyebrow */}
            <div className="fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(212,168,83,0.1)', border: '1px solid rgba(212,168,83,0.2)', color: 'var(--gold)', padding: '6px 16px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 32 }}>
              <Sparkles size={12} /> Where Connections Begin
            </div>

            <h1 className="fade-up" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(3rem, 7vw, 5.5rem)', fontWeight: 600, lineHeight: 1.05, marginBottom: 28, animationDelay: '0.1s' }}>
              Find someone<br />
              <span style={{ background: 'var(--grad-gold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontStyle: 'italic' }}>worth keeping.</span>
            </h1>

            <p className="fade-up" style={{ fontSize: '1.1rem', color: 'var(--text-2)', lineHeight: 1.75, marginBottom: 44, maxWidth: 520, animationDelay: '0.2s' }}>
              A thoughtful approach to modern dating. No endless swiping — send genuine connection requests and build something real.
            </p>

            <div className="fade-up" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', animationDelay: '0.3s' }}>
              <Link to="/register" className="btn btn-gold btn-lg">
                <Heart size={18} /> Create Profile
              </Link>
              <Link to="/login" className="btn btn-ghost btn-lg">Sign In</Link>
            </div>

            {/* Social proof */}
            <div className="fade-up" style={{ display: 'flex', gap: 32, marginTop: 56, animationDelay: '0.4s' }}>
              {[['10K+', 'Members'], ['94%', 'Match Rate'], ['50+', 'Countries']].map(([num, label]) => (
                <div key={label}>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 700, color: 'var(--gold)', lineHeight: 1 }}>{num}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.8rem', fontWeight: 600, marginBottom: 12 }}>A better way to connect</h2>
            <p style={{ color: 'var(--text-2)', maxWidth: 480, margin: '0 auto' }}>Built for people who value meaningful relationships over quantity</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {[
              { icon: <Heart size={22} />, title: 'No Swiping', desc: 'Send a thoughtful request with a personal message. Every connection is intentional.' },
              { icon: <Sparkles size={22} />, title: 'Quality Profiles', desc: 'Multiple photos, detailed bios, and verified accounts ensure authentic matches.' },
              { icon: <Shield size={22} />, title: 'Safe & Private', desc: 'Your data is protected. Only matched users can message you.' },
              { icon: <Globe size={22} />, title: 'Worldwide', desc: 'Connect with people across the globe who share your values and background.' },
            ].map((f, i) => (
              <div key={i} className="fade-up" style={{ padding: 28, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', animationDelay: `${0.1 * i}s` }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--gold-dim)', border: '1px solid rgba(212,168,83,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', marginBottom: 20 }}>{f.icon}</div>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', fontWeight: 600, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '3rem', fontWeight: 600, marginBottom: 16 }}>
            Ready to find <span style={{ color: 'var(--gold)', fontStyle: 'italic' }}>the one?</span>
          </h2>
          <p style={{ color: 'var(--text-2)', marginBottom: 36, fontSize: '1rem' }}>Join thousands who found their match on मिलन</p>
          <Link to="/register" className="btn btn-gold btn-lg">Get Started — It's Free</Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '28px 0', position: 'relative', zIndex: 1 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span className="brand" style={{ fontSize: '1.2rem' }}>मिलन</span>
          <p style={{ color: 'var(--text-3)', fontSize: '0.8rem' }}>© 2026 Milan. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
