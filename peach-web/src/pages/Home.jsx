import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from '../components/Toast';
import CharacterCard, { CharacterCardSkeleton } from '../components/CharacterCard';
import { getCharacters } from '../services/pb';
import { track } from '../utils/analytics';

export default function Home() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [balance] = useState(1000); // Mock balance, будет из API

  useEffect(() => {
    loadCharacters();
    track('view_home');
  }, []);

  async function loadCharacters(pageNum = 1) {
    try {
      console.log('🔵 Home: Начинаем загрузку персонажей...');
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const data = await getCharacters(pageNum, 24);
      console.log('🟢 Home: Получено персонажей:', data.girls.length);
      console.log('📊 Home: Данные:', data);
      
      if (pageNum === 1) {
        setCharacters(data.girls);
      } else {
        setCharacters(prev => [...prev, ...data.girls]);
      }
      
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error('🔴 Home: Ошибка загрузки персонажей:', error);
      toast.error('Не удалось загрузить персонажей');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      console.log('✅ Home: Загрузка завершена');
    }
  }
  
  function loadMore() {
    loadCharacters(page + 1);
  }

  return (
    <div style={{ 
      position: 'relative',
      minHeight: '100vh',
      paddingBottom: '120px',
      // Новый градиент фон
      background: 'linear-gradient(135deg, #1a1c2e 0%, #ff86c8 100%)',
      backgroundSize: '200% 200%',
      animation: 'gradientShift 15s ease infinite'
    }}>
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            color: '#fff',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            fontSize: '14px',
            fontWeight: '500'
          }
        }}
      />
      
      {/* Основной контент */}
      <div style={{ 
        padding: '24px 20px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Заголовок с градиентным текстом */}
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: '900',
          background: 'linear-gradient(135deg, #fff 0%, #e3f2fd 50%, #fff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '12px',
          marginTop: '20px',
          textAlign: 'center',
          letterSpacing: '-0.02em',
          textShadow: '0 0 40px rgba(255, 255, 255, 0.3)',
          animation: 'fadeInDown 0.8s ease-out'
        }}>
          Создай свою AI-девушку
        </h1>
        
        {/* Подзаголовок */}
        <p style={{
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.85)',
          fontSize: '1.1rem',
          marginBottom: '40px',
          fontWeight: '400',
          animation: 'fadeIn 1s ease-out 0.2s both'
        }}>
          Общайся с уникальными AI-персонажами или создай своего
        </p>

        {/* Grid карточек */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}>
          {/* CTA карточка */}
          {!loading && <CharacterCard isCTA />}

          {/* Skeleton loader */}
          {loading && (
            <>
              {[...Array(6)].map((_, i) => (
                <CharacterCardSkeleton key={i} delay={i * 0.1} />
              ))}
            </>
          )}

          {/* Карточки персонажей с анимацией */}
          {!loading && characters.map((character, index) => (
            <div
              key={character.id}
              style={{
                animation: `fadeInScale 0.5s ease-out ${index * 0.05}s both`
              }}
            >
              <CharacterCard character={character} />
            </div>
          ))}
        </div>

        {!loading && characters.length === 0 && (
          <p style={{ 
            textAlign: 'center', 
            color: 'rgba(255, 255, 255, 0.7)', 
            marginTop: '60px',
            fontSize: '1.1rem',
            fontWeight: '500'
          }}>
            Персонажи не найдены
          </p>
        )}

        {/* Кнопка "Показать ещё" с glow эффектом */}
        {!loading && hasMore && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '48px',
            paddingBottom: '20px'
          }}>
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="glow-button"
              style={{
                padding: '16px 40px',
                background: loadingMore 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'rgba(255, 255, 255, 0.95)',
                color: loadingMore ? 'rgba(255, 255, 255, 0.5)' : '#9c27b0',
                border: 'none',
                borderRadius: '20px',
                fontSize: '1.05rem',
                fontWeight: '700',
                cursor: loadingMore ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                minWidth: '220px',
                boxShadow: loadingMore 
                  ? 'none' 
                  : '0 8px 32px rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (!loadingMore) {
                  e.target.style.transform = 'translateY(-2px) scale(1.02)';
                  e.target.style.boxShadow = '0 16px 48px rgba(255, 255, 255, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loadingMore) {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 8px 32px rgba(255, 255, 255, 0.3)';
                }
              }}
            >
              {loadingMore ? '⏳ Загрузка...' : '✨ Показать ещё'}
            </button>
          </div>
        )}
      </div>

      {/* Нижний тулбар */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '80px',
        background: 'rgba(26, 26, 31, 0.85)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 100,
        boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.2)'
      }}>
        {/* Balance */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 20px',
          background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.2), rgba(33, 150, 243, 0.2))',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)'
        }}>
          <span style={{
            fontSize: '1.5rem',
            filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))'
          }}>💎</span>
          <div>
            <div style={{
              fontSize: '0.75rem',
              color: 'rgba(255, 255, 255, 0.6)',
              fontWeight: '500',
              marginBottom: '2px'
            }}>
              Balance
            </div>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {balance.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Центральные кнопки */}
        <div style={{
          display: 'flex',
          gap: '16px'
        }}>
          <button
            onClick={() => window.location.href = '/create'}
            className="toolbar-button"
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #9c27b0, #2196f3)',
              color: '#fff',
              border: 'none',
              borderRadius: '16px',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 16px rgba(156, 39, 176, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 24px rgba(156, 39, 176, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 16px rgba(156, 39, 176, 0.4)';
            }}
          >
            ✨ Создать
          </button>
        </div>

        {/* Profile icon */}
        <button
          onClick={() => window.location.href = '/settings'}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.3), rgba(33, 150, 243, 0.3))',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontSize: '1.5rem',
            boxShadow: '0 4px 16px rgba(156, 39, 176, 0.3)',
            backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)';
            e.target.style.boxShadow = '0 8px 24px rgba(156, 39, 176, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            e.target.style.boxShadow = '0 4px 16px rgba(156, 39, 176, 0.3)';
          }}
        >
          👤
        </button>
      </div>

      {/* CSS анимации */}
      <style>{`
        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .glow-button::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(135deg, #9c27b0, #2196f3);
          border-radius: 20px;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
          filter: blur(10px);
        }

        .glow-button:hover::before {
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
}
