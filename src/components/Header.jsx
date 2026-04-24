import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import './Header.css';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    logout();
    setDropdownOpen(false);
    navigate('/');
  }

  return (
    <header className="header">
      <div className="header-inner container">
        <Link to="/" className="header-logo">
          <div className="logo-badge logo-metal-badge">RIFT</div>
          <span className="logo-text">
            <span className="logo-highlight logo-metal-text">ESPORTS</span>

          </span>
        </Link>

        <nav className="header-nav">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/criar" className={`nav-link ${isActive('/criar') ? 'active' : ''}`}>
            Novo Post
          </Link>

          {user ? (
            <div className="profile-menu" ref={dropdownRef}>
              <button
                className="profile-trigger"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
              >
                {user.avatar_url ? (
                  <img
                    key={user.avatar_url}
                    src={user.avatar_url}
                    alt={user.name}
                    className="profile-avatar"
                    onError={(e) => { 
                      e.target.style.display = 'none'; 
                      const fallback = e.target.nextSibling;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <span
                  className="profile-avatar-fallback"
                  style={{ display: user.avatar_url ? 'none' : 'flex' }}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </span>
                <span className="profile-name">{user.name}</span>
                <svg
                  className={`profile-chevron ${dropdownOpen ? 'open' : ''}`}
                  width="14" height="14" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="profile-dropdown">
                  <div className="dropdown-user-info">
                    <span className="dropdown-user-name">{user.name}</span>
                    <span className="dropdown-user-email">{user.email}</span>
                  </div>
                  <div className="dropdown-divider" />
                  
                  <Link 
                    to="/perfil" 
                    className={`dropdown-item ${isActive('/perfil') ? 'active' : ''}`}
                    onClick={() => setDropdownOpen(false)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                    Meu Perfil
                  </Link>

                  <button 
                    className="dropdown-item dropdown-logout" 
                    onClick={handleLogout}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className={`nav-link nav-link-accent ${isActive('/login') ? 'active' : ''}`}>
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
