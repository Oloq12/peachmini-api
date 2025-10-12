import { useNavigate } from 'react-router-dom';

export default function ChatList({ chats, loading }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            style={{
              padding: '16px',
              background: '#1a1a1f',
              borderRadius: '12px',
              marginBottom: '12px',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}
          >
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: '#2a2a2f'
              }} />
              <div style={{ flex: 1 }}>
                <div style={{
                  height: '16px',
                  background: '#2a2a2f',
                  borderRadius: '4px',
                  width: '40%',
                  marginBottom: '8px'
                }} />
                <div style={{
                  height: '14px',
                  background: '#2a2a2f',
                  borderRadius: '4px',
                  width: '70%'
                }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div style={{
        padding: '60px 20px',
        textAlign: 'center',
        color: '#9ca3af'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>💬</div>
        <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '12px' }}>
          Нет активных чатов
        </h3>
        <p>Выберите персонажа на главной странице</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '0' }}>
      {chats.map((chat) => (
        <div
          key={chat.girlId}
          onClick={() => navigate(`/chats/${chat.girlId}`)}
          style={{
            padding: '16px 20px',
            background: '#1a1a1f',
            borderBottom: '1px solid #2a2a2f',
            cursor: 'pointer',
            transition: 'background 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#252530'}
          onMouseOut={(e) => e.currentTarget.style.background = '#1a1a1f'}
        >
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: `url(${chat.avatar}) center/cover`,
              backgroundColor: '#2a2a2f',
              flexShrink: 0
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px'
              }}>
                <h4 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#fff',
                  margin: 0
                }}>
                  {chat.name}
                </h4>
                <span style={{
                  fontSize: '0.75rem',
                  color: '#6b7280'
                }}>
                  {chat.lastTime}
                </span>
              </div>
              <p style={{
                fontSize: '0.9rem',
                color: '#9ca3af',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {chat.lastMessage}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

