import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Compass, Bell, Heart, MessageCircle, User, LogOut, ShieldCheck } from 'lucide-react';

// Admin emails — add yours here OR set via VITE_ADMIN_EMAIL env var
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || '';

export default function Navbar({ pendingCount = 0, isAdmin = false }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const showAdmin = isAdmin || (ADMIN_EMAIL && user?.email === ADMIN_EMAIL);
  const isActive = (path) => location.pathname.startsWith(path) ? 'nav-link active' : 'nav-link';

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/browse" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', fontWeight: 600, background: 'var(--grad-gold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', textDecoration: 'none' }}>
          मिलन
        </Link>

        <div className="nav-links">
          <Link to="/browse" className={isActive('/browse')}>
            <Compass size={15} /><span>Discover</span>
          </Link>
          <Link to="/requests" className={isActive('/requests')} style={{ position: 'relative' }}>
            <Bell size={15} /><span>Requests</span>
            {pendingCount > 0 && <span className="nav-badge">{pendingCount}</span>}
          </Link>
          <Link to="/matches" className={isActive('/matches')}>
            <Heart size={15} /><span>Matches</span>
          </Link>
          <Link to="/messages" className={isActive('/messages')}>
            <MessageCircle size={15} /><span>Messages</span>
          </Link>
          <Link to="/profile" className={isActive('/profile')}>
            <User size={15} /><span>Profile</span>
          </Link>
          {showAdmin && (
            <Link to="/admin" className={`nav-link admin-link ${location.pathname === '/admin' ? 'active' : ''}`}>
              <ShieldCheck size={15} /><span>Admin</span>
            </Link>
          )}
          <button className="nav-link logout" onClick={() => { logout(); navigate('/'); }}>
            <LogOut size={15} /><span>Out</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
