import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar({ onNewOpportunity }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        {/* Wordmark */}
        <div className={styles.wordmark}>
          <span className={styles.wordmarkText}>Pipeline</span>
          <span className="label" style={{ marginLeft: '0.5rem', opacity: 0.5 }}>CRM</span>
        </div>

        {/* Desktop nav */}
        <nav className={styles.desktopNav}>
          <span className={styles.userGreeting}>
            <span className="label-muted">Signed in as</span>
            <span className={styles.userName}>{user?.name}</span>
          </span>

          <button
            className="btn btn-primary btn-sm"
            onClick={onNewOpportunity}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="7" y1="1" x2="7" y2="13" /><line x1="1" y1="7" x2="13" y2="7" />
            </svg>
            New Opportunity
          </button>

          <button
            className="btn btn-ghost btn-sm"
            onClick={logout}
            title="Sign out"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </button>
        </nav>

        {/* Mobile: new + menu */}
        <div className={styles.mobileNav}>
          <button className="btn btn-primary btn-sm" onClick={onNewOpportunity}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="7" y1="1" x2="7" y2="13" /><line x1="1" y1="7" x2="13" y2="7" />
            </svg>
            New
          </button>
          <button className={`btn btn-ghost btn-icon ${styles.hamburger}`} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="17" x2="21" y2="17" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          <div className={`container ${styles.mobileMenuInner}`}>
            <div className={styles.userGreeting}>
              <span className="label-muted">Signed in as</span>
              <span className={styles.userName}>{user?.name}</span>
            </div>
            <hr className="divider" />
            <button className="btn btn-ghost btn-sm w-full" onClick={() => { logout(); setMenuOpen(false); }}>
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
