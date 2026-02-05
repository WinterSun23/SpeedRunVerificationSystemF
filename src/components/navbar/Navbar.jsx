import './Navbar.css';

function Navbar({ navItems, currentView, setCurrentView, onLogout, userRole }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="logo">⚡</span>
        <span className="brand-text">Speedrun Portal</span>
        <span className="role-badge">{userRole}</span>
      </div>
      
      <div className="navbar-menu">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => setCurrentView(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </div>

      <button className="logout-btn" onClick={onLogout}>
        <span>🚪</span>
        <span>Logout</span>
      </button>
    </nav>
  );
}

export default Navbar;