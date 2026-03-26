import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Heart, Search, Bell, MessageCircle, User, LogOut } from 'lucide-react';

export default function Navbar({ pendingCount = 0 }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="app-container navbar-inner">
        <Link to="/browse" className="brand">
          मिलन <span>Milan</span>
        </Link>
        <div className="nav-links">
          <Link to="/browse" className={isActive('/browse')}>
            <Search size={16} /> Discover
          </Link>
          <Link to="/requests" className={isActive('/requests')}>
            <Bell size={16} /> Requests
            {pendingCount > 0 && <span className="badge">{pendingCount}</span>}
          </Link>
          <Link to="/matches" className={isActive('/matches')}>
            <Heart size={16} /> Matches
          </Link>
          <Link to="/messages" className={isActive('/messages')}>
            <MessageCircle size={16} /> Messages
          </Link>
          <Link to="/profile" className={isActive('/profile')}>
            <User size={16} /> Profile
          </Link>
          <button className="nav-link logout" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
