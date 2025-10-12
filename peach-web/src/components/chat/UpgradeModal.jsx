import { useNavigate } from 'react-router-dom';

export default function UpgradeModal({ onClose }) {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate('/store');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#1a1a1f',
          borderRadius: '20px',
          padding: '32px 24px',
          maxWidth: '400px',
          width: '100%',
          border: '2px solid #8b5cf6',
          animation: 'fadeIn 0.3s ease-out'
        }}
      >
        <div style={{
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>💎</div>
          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: '700',
            color: '#fff',
            marginBottom: '12px'
          }}>
            Лимит сообщений исчерпан
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#9ca3af',
            lineHeight: '1.5'
          }}>
            Перейдите в магазин, чтобы получить больше сообщений или оформить Premium подписку
          </p>
        </div>

        <div style={{
          background: '#0b0b10',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: '600',
            color: '#fff',
            marginBottom: '12px'
          }}>
            ✨ Доступно в магазине:
          </h3>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            color: '#9ca3af',
            fontSize: '0.95rem'
          }}>
            <li style={{ marginBottom: '8px' }}>💬 Пакеты сообщений</li>
            <li style={{ marginBottom: '8px' }}>💎 Premium подписка (безлимит)</li>
            <li style={{ marginBottom: '8px' }}>🎁 Бонусы и скидки</li>
          </ul>
        </div>

        <div style={{
          display: 'flex',
          gap: '12px'
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '14px',
              background: '#2a2a2f',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Закрыть
          </button>
          <button
            onClick={handleUpgrade}
            style={{
              flex: 1,
              padding: '14px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            🛒 В магазин
          </button>
        </div>
      </div>
    </div>
  );
}

