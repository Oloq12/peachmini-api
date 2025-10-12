export default function Skeleton({ width = '100%', height = '20px', rounded = '8px', className = '' }) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-gray-800/50 via-gray-700/50 to-gray-800/50 ${className}`}
      style={{
        width,
        height,
        borderRadius: rounded,
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite'
      }}
    >
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

export function CharacterCardSkeleton() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(109, 40, 217, 0.1) 100%)',
      border: '1px solid rgba(139, 92, 246, 0.2)',
      borderRadius: '20px',
      padding: '16px',
      cursor: 'pointer'
    }}>
      <Skeleton width="100%" height="200px" rounded="16px" />
      <div style={{ marginTop: '12px' }}>
        <Skeleton width="60%" height="20px" />
        <div style={{ marginTop: '8px' }}>
          <Skeleton width="80%" height="14px" />
        </div>
      </div>
    </div>
  );
}

export function ChatMessageSkeleton() {
  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      padding: '12px',
      maxWidth: '70%'
    }}>
      <Skeleton width="40px" height="40px" rounded="50%" />
      <div style={{ flex: 1 }}>
        <Skeleton width="30%" height="14px" />
        <div style={{ marginTop: '8px' }}>
          <Skeleton width="90%" height="14px" />
          <div style={{ marginTop: '4px' }}>
            <Skeleton width="70%" height="14px" />
          </div>
        </div>
      </div>
    </div>
  );
}

