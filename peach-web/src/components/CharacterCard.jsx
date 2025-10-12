import { useNavigate } from 'react-router-dom';

export default function CharacterCard({ character, isCTA = false }) {
  const navigate = useNavigate();

  if (isCTA) {
    return (
      <div
        onClick={() => navigate('/create')}
        style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
          borderRadius: '20px',
          padding: '40px 20px',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '300px',
          boxShadow: '0 10px 30px rgba(139, 92, 246, 0.3)',
          transition: 'all 0.3s ease',
          gridColumn: '1 / -1'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 15px 40px rgba(139, 92, 246, 0.4)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 10px 30px rgba(139, 92, 246, 0.3)';
        }}
      >
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>✨</div>
        <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '10px', color: '#fff' }}>
          Создать своего
        </h2>
        <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.9)', textAlign: 'center' }}>
          Создай уникального персонажа
        </p>
      </div>
    );
  }

  return (
    <div
      onClick={() => navigate(`/c/${character.slug}`)}
      style={{
        background: '#1a1a1f',
        borderRadius: '20px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.3)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
      }}
    >
      <div style={{
        aspectRatio: '4/5',
        background: `url(${character.avatar}) center/cover`,
        backgroundColor: '#2a2a2f'
      }} />
      <div style={{ padding: '16px' }}>
        <h3 style={{ 
          fontSize: '1.3rem', 
          fontWeight: '600', 
          marginBottom: '4px',
          color: '#fff'
        }}>
          {character.name}
        </h3>
        <p style={{ 
          fontSize: '0.9rem', 
          color: '#9ca3af',
          margin: 0
        }}>
          {character.shortDesc}
        </p>
      </div>
    </div>
  );
}

export function CharacterCardSkeleton() {
  return (
    <div style={{
      background: '#1a1a1f',
      borderRadius: '20px',
      overflow: 'hidden',
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
    }}>
      <div style={{
        aspectRatio: '4/5',
        backgroundColor: '#2a2a2f'
      }} />
      <div style={{ padding: '16px' }}>
        <div style={{
          height: '20px',
          backgroundColor: '#2a2a2f',
          borderRadius: '4px',
          marginBottom: '8px',
          width: '60%'
        }} />
        <div style={{
          height: '16px',
          backgroundColor: '#2a2a2f',
          borderRadius: '4px',
          width: '80%'
        }} />
      </div>
    </div>
  );
}

