import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Compass, Bell, Heart, MessageCircle, User, LogOut, ShieldCheck } from 'lucide-react';

export default function Navbar({ pendingCount = 0 }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = user?.email === import.meta.env.VITE_ADMIN_EMAIL || user?.is_admin;
  const isActive = (path) => location.pathname.startsWith(path) ? 'nav-link active' : 'nav-link';

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/browse" className="brand">मिलन</Link>

        <div className="nav-links">
          <Link to="/browse" className={isActive('/browse')}>
            <Compass size={16} /><span>Discover</span>
          </Link>
          <Link to="/requests" className={isActive('/requests')} style={{ position: 'relative' }}>
            <Bell size={16} /><span>Requests</span>
            {pendingCount > 0 && <span className="nav-badge">{pendingCount}</span>}
          </Link>
          <Link to="/matches" className={isActive('/matches')}>
            <Heart size={16} /><span>Matches</span>
          </Link>
          <Link to="/messages" className={isActive('/messages')}>
            <MessageCircle size={16} /><span>Messages</span>
          </Link>
          <Link to="/profile" className={isActive('/profile')}>
            <User size={16} /><span>Profile</span>
          </Link>
          {isAdmin && (
            <Link to="/admin" className={`nav-link admin-link ${location.pathname === '/admin' ? 'active' : ''}`}>
              <ShieldCheck size={16} /><span>Admin</span>
            </Link>
          )}
          <button className="nav-link logout" onClick={() => { logout(); navigate('/'); }}>
            <LogOut size={16} /><span>Out</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
