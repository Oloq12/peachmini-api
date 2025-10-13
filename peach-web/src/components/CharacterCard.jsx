import { useNavigate } from 'react-router-dom';

export default function CharacterCard({ character, isCTA = false }) {
  const navigate = useNavigate();

  if (isCTA) {
    return (
      <div
        onClick={() => navigate('/create')}
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '32px 20px',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '280px',
          border: '2px dashed rgba(255, 255, 255, 0.3)',
          boxShadow: '0 12px 40px rgba(255, 255, 255, 0.1)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          gridColumn: '1 / -1',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
          e.currentTarget.style.boxShadow = '0 20px 60px rgba(156, 39, 176, 0.4)';
          e.currentTarget.style.borderColor = 'rgba(156, 39, 176, 0.6)';
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(156, 39, 176, 0.25), rgba(33, 150, 243, 0.25))';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 12px 40px rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))';
        }}
      >
        <div style={{ 
          fontSize: '4rem', 
          marginBottom: '20px',
          filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.5))',
          animation: 'float 3s ease-in-out infinite'
        }}>✨</div>
        <h2 style={{ 
          fontSize: '1.75rem', 
          fontWeight: '800', 
          marginBottom: '12px', 
          color: '#fff',
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
        }}>
          Создать своего
        </h2>
        <p style={{ 
          fontSize: '1rem', 
          color: 'rgba(255,255,255,0.85)', 
          textAlign: 'center',
          fontWeight: '500'
        }}>
          Уникальный AI-персонаж
        </p>
        
        <style>{`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      onClick={() => navigate(`/c/${character.slug}`)}
      style={{
        background: 'rgba(26, 26, 31, 0.7)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        padding: '16px',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
        e.currentTarget.style.boxShadow = '0 16px 48px rgba(156, 39, 176, 0.4)';
        e.currentTarget.style.borderColor = 'rgba(156, 39, 176, 0.5)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      }}
    >
      {/* Круглый аватар с glow */}
      <div style={{
        position: 'relative',
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          background: `url(${character.avatar}) center/cover`,
          backgroundColor: '#2a2a2f',
          border: '3px solid rgba(156, 39, 176, 0.4)',
          boxShadow: '0 0 20px rgba(156, 39, 176, 0.3), 0 8px 16px rgba(0, 0, 0, 0.4)',
          transition: 'all 0.3s ease',
          position: 'relative'
        }}
        onMouseEnter={(e) => {
          e.target.style.borderColor = 'rgba(156, 39, 176, 0.8)';
          e.target.style.boxShadow = '0 0 32px rgba(156, 39, 176, 0.6), 0 12px 24px rgba(0, 0, 0, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.borderColor = 'rgba(156, 39, 176, 0.4)';
          e.target.style.boxShadow = '0 0 20px rgba(156, 39, 176, 0.3), 0 8px 16px rgba(0, 0, 0, 0.4)';
        }}
        />
      </div>
      
      {/* Info */}
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '700', 
          marginBottom: '8px',
          color: '#fff',
          lineHeight: '1.2'
        }}>
          {character.name}
        </h3>
        <p style={{ 
          fontSize: '0.875rem', 
          color: 'rgba(255, 255, 255, 0.7)',
          margin: 0,
          lineHeight: '1.4',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {character.shortDesc}
        </p>
      </div>
    </div>
  );
}

export function CharacterCardSkeleton({ delay = 0 }) {
  return (
    <div style={{
      background: 'rgba(26, 26, 31, 0.7)',
      backdropFilter: 'blur(10px)',
      borderRadius: '24px',
      padding: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      animation: `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
      animationDelay: `${delay}s`,
      opacity: 0,
      animationFillMode: 'forwards'
    }}>
      {/* Круглый аватар skeleton */}
      <div style={{
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          backgroundColor: 'rgba(42, 42, 47, 0.8)',
          border: '3px solid rgba(255, 255, 255, 0.05)'
        }} />
      </div>
      
      {/* Info skeleton */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          height: '20px',
          backgroundColor: 'rgba(42, 42, 47, 0.8)',
          borderRadius: '8px',
          marginBottom: '10px',
          width: '70%',
          margin: '0 auto 10px'
        }} />
        <div style={{
          height: '16px',
          backgroundColor: 'rgba(42, 42, 47, 0.8)',
          borderRadius: '8px',
          width: '90%',
          margin: '0 auto'
        }} />
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

