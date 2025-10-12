import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: '🔗',
      title: 'Реферальная программа',
      description: 'Приглашайте друзей и зарабатывайте',
      path: '/referrals',
      badge: '+100 PP'
    },
    {
      icon: '🔔',
      title: 'Уведомления',
      description: 'Настройте уведомления',
      path: null
    },
    {
      icon: '🌐',
      title: 'Язык',
      description: 'Русский',
      path: null
    },
    {
      icon: 'ℹ️',
      title: 'О приложении',
      description: 'Версия 1.0.0',
      path: null
    }
  ];

  return (
    <div style={{ 
      padding: '20px',
      minHeight: '100vh',
      paddingBottom: '100px',
      backgroundColor: '#0b0b10'
    }}>
      <h2 style={{ 
        color: '#fff', 
        fontSize: '2rem', 
        marginBottom: '20px',
        fontWeight: 'bold'
      }}>
        ⚙️ Настройки
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => item.path && navigate(item.path)}
            disabled={!item.path}
            style={{
              background: 'linear-gradient(135deg, #1a1a24 0%, #252535 100%)',
              border: '1px solid rgba(147, 51, 234, 0.3)',
              borderRadius: '20px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: item.path ? 'pointer' : 'default',
              transition: 'all 0.3s ease',
              opacity: item.path ? 1 : 0.6
            }}
            onMouseEnter={(e) => {
              if (item.path) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.6)';
              }
            }}
            onMouseLeave={(e) => {
              if (item.path) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.3)';
              }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                fontSize: '32px',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(147, 51, 234, 0.2)',
                borderRadius: '12px'
              }}>
                {item.icon}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ 
                  color: '#fff', 
                  fontSize: '1rem', 
                  fontWeight: 'bold',
                  marginBottom: '4px'
                }}>
                  {item.title}
                </div>
                <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                  {item.description}
                </div>
              </div>
            </div>
            {item.badge && (
              <div style={{
                background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
                color: '#fff',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                {item.badge}
              </div>
            )}
            {item.path && (
              <div style={{ color: '#9ca3af', fontSize: '1.5rem' }}>›</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

