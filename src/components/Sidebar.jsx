import React from 'react';
import '../styles/variables.css';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ onNavigate, currentView = 'dashboard' }) => {
  const { logout, currentUser } = useAuth();
  const menuItems = [
    { name: 'Dashboard', icon: 'Active', id: 'dashboard' },
    { name: 'Patients', icon: '', id: 'patients' },
    { name: 'Analytics', icon: '', id: 'analytics' },
    { name: 'Alerts', icon: '', id: 'alerts' },
    { name: 'Reports', icon: '', id: 'reports' },
    { name: 'Settings', icon: '', id: 'settings' },
  ];

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logoArea}>
        <h2 style={styles.logoText}>Glucose<span style={{ fontWeight: 'var(--font-weight-regular)' }}>Guard</span></h2>
      </div>
      <nav style={styles.nav}>
        <ul style={styles.ul}>
          {menuItems.map((item) => {
            const isActive = currentView === item.id || (currentView === 'patient-detail' && item.id === 'patients');
            return (
              <li key={item.name} style={styles.li}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (item.id === 'dashboard' || item.id === 'settings' || item.id === 'alerts' || item.id === 'analytics' || item.id === 'patients') {
                      onNavigate(item.id);
                    }
                  }}
                  style={{
                    ...styles.link,
                    ...(isActive ? styles.activeLink : {})
                  }}
                >
                  {item.name}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
      <div style={styles.userProfile}>
        <div style={styles.avatar}>DR</div>
        <div style={styles.userInfo}>
          <p style={styles.userName}>Dr. {currentUser?.displayName ?? 'Clinician'}</p>
          <p style={styles.userRole}>Cardiologist</p>
        </div>
        <button
          onClick={logout}
          style={styles.logoutButton}
          title="Log out"
        >
          &#x2192;
        </button>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: '280px',
    backgroundColor: 'var(--color-primary)', /* Sidebar Blue */
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    borderRight: 'none',
    position: 'fixed',
    left: 0,
    top: 0,
    zIndex: 10,
  },
  logoArea: {
    padding: 'var(--spacing-lg) var(--spacing-lg)',
    marginBottom: 'var(--spacing-md)',
  },
  logoText: {
    fontSize: '1.5rem',
    fontWeight: 'var(--font-weight-heavy)',
    letterSpacing: '-0.03em',
    color: '#FFFFFF', /* White Logo */
  },
  nav: {
    flex: 1,
    padding: '0 var(--spacing-sm)',
  },
  ul: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  li: {
    marginBottom: '0',
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 24px',
    borderRadius: '8px',
    textDecoration: 'none',
    color: 'rgba(255, 255, 255, 0.7)', // Inactive: White opacity
    fontWeight: 'var(--font-weight-medium)',
    fontSize: '0.95rem',
    transition: 'all 0.2s ease',
    borderLeft: 'none', // Remove border for pill shape
  },
  activeLink: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Stronger white tint
    color: '#FFFFFF', // White
    fontWeight: 'var(--font-weight-bold)',
    // borderLeft removed
  },
  userProfile: {
    padding: 'var(--spacing-lg)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-sm)',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#FFFFFF', /* White bg */
    color: 'var(--color-primary)', /* Blue text */
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'var(--font-weight-bold)',
    fontSize: '0.8rem',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    margin: 0,
    fontSize: '0.9rem',
    fontWeight: 'var(--font-weight-bold)',
    color: '#FFFFFF', // White
  },
  userRole: {
    margin: 0,
    fontSize: '0.8rem',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  logoutButton: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '1.2rem',
    cursor: 'pointer',
    padding: '4px 6px',
    borderRadius: '6px',
    lineHeight: 1,
    transition: 'color 0.2s',
  },
};

export default Sidebar;
