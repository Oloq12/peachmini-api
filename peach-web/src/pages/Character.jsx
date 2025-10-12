import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from '../components/Toast';
import { getCharacterBySlug } from '../services/pb';

export default function Character() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPhrases, setShowPhrases] = useState(false);

  useEffect(() => {
    loadCharacter();
  }, [slug]);

  async function loadCharacter() {
    try {
      setLoading(true);
      const data = await getCharacterBySlug(slug);
      if (!data) {
        toast.error('Персонаж не найден');
        navigate('/');
        return;
      }
      setCharacter(data);
    } catch (error) {
      console.error('Ошибка загрузки персонажа:', error);
      toast.error('Не удалось загрузить персонажа');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: '100px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #2a2a2f',
          borderTop: '4px solid #8b5cf6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  if (!character) return null;

  return (
    <div style={{
      minHeight: '100vh',
      paddingBottom: '100px'
    }}>
      {/* Изображение персонажа */}
      <div style={{
        height: '50vh',
        background: `url(${character.avatar}) center/cover`,
        backgroundColor: '#2a2a2f',
        position: 'relative'
      }}>
        {/* Кнопка назад */}
        <button
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: 'rgba(0,0,0,0.5)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '1.5rem',
            backdropFilter: 'blur(10px)'
          }}
        >
          ←
        </button>
      </div>

      {/* Информация о персонаже */}
      <div style={{
        padding: '24px',
        background: 'linear-gradient(to bottom, transparent, #0b0b10 40px)',
        marginTop: '-40px',
        position: 'relative'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: '#fff',
          marginBottom: '12px'
        }}>
          {character.name}
        </h1>

        <p style={{
          fontSize: '1.1rem',
          color: '#9ca3af',
          marginBottom: '24px'
        }}>
          {character.shortDesc}
        </p>

        {/* Bullets из persona */}
        {character.persona && (
          <div style={{
            marginBottom: '24px',
            padding: '20px',
            background: 'rgba(139, 92, 246, 0.05)',
            border: '1px solid rgba(139, 92, 246, 0.1)',
            borderRadius: '16px'
          }}>
            <h3 style={{
              fontSize: '0.9rem',
              color: '#8b5cf6',
              marginBottom: '12px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              О персонаже
            </h3>
            {(() => {
              // Извлекаем 3-4 ключевых момента из persona
              const personaText = character.persona;
              const sentences = personaText
                .split(/[.!?]+/)
                .map(s => s.trim())
                .filter(s => s.length > 10)
                .slice(0, 4);
              
              return sentences.map((sentence, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    marginBottom: idx < sentences.length - 1 ? '10px' : 0,
                    alignItems: 'flex-start'
                  }}
                >
                  <span style={{
                    color: '#8b5cf6',
                    fontSize: '1.2rem',
                    lineHeight: '1.5',
                    marginTop: '2px'
                  }}>
                    •
                  </span>
                  <p style={{
                    margin: 0,
                    fontSize: '0.95rem',
                    color: '#e5e7eb',
                    lineHeight: '1.6',
                    flex: 1
                  }}>
                    {sentence}
                  </p>
                </div>
              ));
            })()}
          </div>
        )}

        {/* Кнопка начать чат */}
        <button
          onClick={() => navigate(`/chats/${character.id}`)}
          style={{
            width: '100%',
            padding: '16px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '20px',
            fontSize: '1.2rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 10px 30px rgba(139, 92, 246, 0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 15px 40px rgba(139, 92, 246, 0.4)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 10px 30px rgba(139, 92, 246, 0.3)';
          }}
        >
          Начать чат
        </button>

        {/* Кнопка предпросмотра реплик */}
        {character.starterPhrases && (() => {
          try {
            const phrases = typeof character.starterPhrases === 'string' 
              ? JSON.parse(character.starterPhrases) 
              : character.starterPhrases;
            
            if (Array.isArray(phrases) && phrases.length > 0) {
              return (
                <div style={{ marginTop: '16px' }}>
                  <button
                    onClick={() => setShowPhrases(!showPhrases)}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: 'rgba(139, 92, 246, 0.1)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '16px',
                      color: '#8b5cf6',
                      fontSize: '1rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    💬 Предпросмотр реплик
                    <span style={{ 
                      fontSize: '0.8rem',
                      transition: 'transform 0.3s ease',
                      transform: showPhrases ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}>
                      ▼
                    </span>
                  </button>

                  {showPhrases && (
                    <div style={{
                      marginTop: '12px',
                      background: '#1a1a1f',
                      border: '1px solid #2a2a2f',
                      borderRadius: '16px',
                      padding: '16px',
                      animation: 'fadeIn 0.3s ease'
                    }}>
                      <h3 style={{
                        fontSize: '0.9rem',
                        color: '#9ca3af',
                        marginBottom: '12px',
                        fontWeight: '500'
                      }}>
                        Примеры фраз:
                      </h3>
                      {phrases.map((phrase, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '12px',
                            background: 'rgba(139, 92, 246, 0.05)',
                            border: '1px solid rgba(139, 92, 246, 0.1)',
                            borderRadius: '12px',
                            marginBottom: idx < phrases.length - 1 ? '8px' : 0,
                            color: '#e5e7eb',
                            fontSize: '0.95rem',
                            lineHeight: '1.5'
                          }}
                        >
                          "{phrase}"
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
          } catch (e) {
            console.warn('Failed to parse starterPhrases:', e);
          }
          return null;
        })()}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

