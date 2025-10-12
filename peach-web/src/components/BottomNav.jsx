import { NavLink } from 'react-router-dom';

export default function BottomNav() {
  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/chats', label: 'Chats', icon: '💬' },
    { path: '/create', label: 'Create', icon: '✨' },
    { path: '/quests', label: 'Quests', icon: '🎯' },
    { path: '/store', label: 'Store', icon: '🛍️' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#1a1a1f',
      borderTop: '1px solid #2a2a2f',
      padding: '8px 0',
      zIndex: 1000
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '4px',
        maxWidth: '600px',
        margin: '0 auto',
        padding: '0 8px'
      }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '8px 4px',
              borderRadius: '20px',
              textDecoration: 'none',
              background: isActive ? '#8b5cf6' : 'transparent',
              color: isActive ? '#fff' : '#9ca3af',
              transition: 'all 0.3s ease',
              fontSize: '10px',
              fontWeight: isActive ? '600' : '400'
            })}
          >
            <span style={{ 
              fontSize: '20px', 
              marginBottom: '2px' 
            }}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

