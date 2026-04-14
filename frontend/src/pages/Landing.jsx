import { Link } from 'react-router-dom';
import { Heart, Sparkles, Shield, MessageCircle } from 'lucide-react';

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>

      {/* Ambient glows */}
      <div style={{ position: 'fixed', top: '-15%', right: '-5%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,168,83,0.07) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-20%', left: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,99,122,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Nav */}
      <nav style={{ position: 'relative', zIndex: 10, padding: '28px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.9rem', fontWeight: 600, background: 'var(--grad-gold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>मिलन</span>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link to="/login" style={{ color: 'var(--text-2)', fontSize: '0.9rem', fontWeight: 500, padding: '9px 18px', borderRadius: 8, border: '1px solid var(--border)', transition: 'all 0.2s' }}>Sign In</Link>
            <Link to="/register" className="btn btn-gold btn-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: 'relative', zIndex: 1, padding: '110px 0 90px' }}>
        <div className="container">
          <div style={{ maxWidth: 680 }}>

            <div className="fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(212,168,83,0.08)', border: '1px solid rgba(212,168,83,0.18)', color: 'var(--gold-light)', padding: '7px 18px', borderRadius: 30, fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 36 }}>
              <Sparkles size={11} /> A new kind of dating
            </div>

            <h1 className="fade-up" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(3.2rem, 7vw, 5.8rem)', fontWeight: 600, lineHeight: 1.05, marginBottom: 28, animationDelay: '0.1s' }}>
              Find someone<br />
              <em style={{ background: 'var(--grad-gold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>worth keeping.</em>
            </h1>

            <p className="fade-up" style={{ fontSize: '1.1rem', color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 48, maxWidth: 500, animationDelay: '0.2s' }}>
              Skip the endless swiping. Send a genuine connection request, start a real conversation, and let things unfold naturally.
            </p>

            <div className="fade-up" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 64, animationDelay: '0.3s' }}>
              <Link to="/register" className="btn btn-gold btn-lg">
                <Heart size={17} /> Create Your Profile
              </Link>
              <Link to="/login" className="btn btn-ghost btn-lg">Sign In</Link>
            </div>

            {/* Trust indicators — no fake numbers */}
            <div className="fade-up" style={{ display: 'flex', gap: 24, flexWrap: 'wrap', animationDelay: '0.4s' }}>
              {[
                { icon: '🔒', text: 'No fake profiles' },
                { icon: '💬', text: 'Real conversations' },
                { icon: '✨', text: 'Free to join' },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-3)', fontSize: '0.85rem' }}>
                  <span>{icon}</span> {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 0', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.8rem', fontWeight: 600, marginBottom: 12 }}>How it works</h2>
            <p style={{ color: 'var(--text-2)', maxWidth: 420, margin: '0 auto', fontSize: '0.95rem' }}>Three simple steps to find someone special</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 2, position: 'relative' }}>
            {[
              { step: '01', icon: <Sparkles size={24} />, title: 'Build your profile', desc: "Upload your best photos, write about yourself honestly, and describe what you're looking for." },
              { step: '02', icon: <Heart size={24} />, title: 'Send a request', desc: 'Browse profiles and send a personal connection request with a message — no swiping, just intention.' },
              { step: '03', icon: <MessageCircle size={24} />, title: 'Start talking', desc: 'Once accepted, chat freely and get to know each other at your own pace.' },
            ].map((item, i) => (
              <div key={i} className="fade-up" style={{ padding: '36px 32px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', animationDelay: `${0.1 * i}s`, position: 'relative' }}>
                <div style={{ position: 'absolute', top: 24, right: 24, fontFamily: 'Cormorant Garamond, serif', fontSize: '3.5rem', fontWeight: 700, color: 'rgba(212,168,83,0.08)', lineHeight: 1 }}>{item.step}</div>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--gold-dim)', border: '1px solid rgba(212,168,83,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', marginBottom: 22 }}>{item.icon}</div>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontWeight: 600, marginBottom: 10 }}>{item.title}</h3>
                <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Milan */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 0', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
            <div>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.6rem', fontWeight: 600, lineHeight: 1.2, marginBottom: 20 }}>
                Built for people who take love <em style={{ color: 'var(--gold)' }}>seriously.</em>
              </h2>
              <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 28, fontSize: '0.95rem' }}>
                Milan is designed for those tired of shallow connections. Every feature is built around starting conversations that matter — not racking up matches you never talk to.
              </p>
              <Link to="/register" className="btn btn-outline">Join Today →</Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { icon: <Shield size={20} />, title: 'Verified Profiles', desc: 'Photo verification keeps fake accounts out.' },
                { icon: <Heart size={20} />, title: 'Intentional Matching', desc: 'Request-based system ensures mutual interest.' },
                { icon: <MessageCircle size={20} />, title: 'Real Conversations', desc: 'Only connected users can message each other.' },
                { icon: <Sparkles size={20} />, title: 'No Algorithms', desc: 'Browse freely — no black box deciding who you see.' },
              ].map((f, i) => (
                <div key={i} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}>
                  <div style={{ color: 'var(--gold)', marginBottom: 10 }}>{f.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 6 }}>{f.title}</div>
                  <div style={{ color: 'var(--text-3)', fontSize: '0.8rem', lineHeight: 1.5 }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ position: 'relative', zIndex: 1, padding: '100px 0', borderTop: '1px solid rgba(255,255,255,0.04)', textAlign: 'center' }}>
        <div className="container">
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 600, lineHeight: 1.2, marginBottom: 18 }}>
              The right person is out there.<br />
              <em style={{ color: 'var(--gold)' }}>Start looking.</em>
            </h2>
            <p style={{ color: 'var(--text-2)', marginBottom: 36, fontSize: '0.95rem' }}>Create your profile in minutes. Free to join, always.</p>
            <Link to="/register" className="btn btn-gold btn-lg">Create My Profile</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '28px 0', position: 'relative', zIndex: 1 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', fontWeight: 600, background: 'var(--grad-gold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>मिलन</span>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <span style={{ color: 'var(--text-3)', fontSize: '0.8rem' }}>© 2026 Milan</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
