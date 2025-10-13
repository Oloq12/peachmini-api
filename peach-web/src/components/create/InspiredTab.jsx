import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from '../Toast';
import { pb } from '../../services/pb';
import { track } from '../../utils/analytics';
import { questActions } from '../../utils/questTracker';

// Набор аватаров
const AVATAR_POOL = [
  'https://i.pravatar.cc/300?img=1',
  'https://i.pravatar.cc/300?img=5',
  'https://i.pravatar.cc/300?img=9',
  'https://i.pravatar.cc/300?img=16',
  'https://i.pravatar.cc/300?img=20',
  'https://i.pravatar.cc/300?img=26',
  'https://i.pravatar.cc/300?img=31',
  'https://i.pravatar.cc/300?img=32',
  'https://i.pravatar.cc/300?img=36',
  'https://i.pravatar.cc/300?img=44',
  'https://i.pravatar.cc/300?img=47',
  'https://i.pravatar.cc/300?img=49'
];

export default function InspiredTab() {
  const navigate = useNavigate();
  const [samples, setSamples] = useState(['', '', '']);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState(AVATAR_POOL[Math.floor(Math.random() * AVATAR_POOL.length)]);

  // Проверка на PII (имена, email, телефоны)
  const checkForPII = (text) => {
    const piiPatterns = [
      /\b[A-Z][a-z]+ [A-Z][a-z]+\b/, // Имена (First Last)
      /\b[А-ЯЁ][а-яё]+ [А-ЯЁ][а-яё]+\b/, // Русские имена
      /\b[\w.-]+@[\w.-]+\.\w+\b/, // Email
      /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/, // Телефоны
      /\b\+?\d{10,}\b/ // Международные телефоны
    ];
    
    return piiPatterns.some(pattern => pattern.test(text));
  };

  const generateAvatar = () => {
    const newAvatar = AVATAR_POOL[Math.floor(Math.random() * AVATAR_POOL.length)];
    setAvatar(newAvatar);
    toast.info('Аватар обновлен!', { duration: 2000 });
  };

  const handleExtract = async () => {
    // Валидация: минимум 3 фразы, не пустые
    const filledSamples = samples.filter(s => s.trim().length > 0);
    
    if (filledSamples.length < 3) {
      toast.error('❌ Заполните минимум 3 примера диалогов');
      return;
    }
    
    // Проверка что каждая фраза достаточно длинная
    const tooShort = filledSamples.some(s => s.trim().length < 10);
    if (tooShort) {
      toast.error('❌ Каждый пример должен содержать минимум 10 символов');
      return;
    }

    // Проверка на PII
    const hasPII = filledSamples.some(s => checkForPII(s));
    if (hasPII) {
      const confirmed = window.confirm(
        '⚠️ ВНИМАНИЕ: В ваших примерах обнаружены личные данные (имена, email, телефоны).\n\n' +
        'Рекомендуем заменить их на вымышленные для защиты конфиденциальности.\n\n' +
        'Продолжить?'
      );
      if (!confirmed) return;
    }

    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';
      const response = await fetch(`${API_URL}/api/persona/extract`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ samples: filledSamples })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка сервера');
      }

      const result = await response.json();
      if (result.ok && result.data) {
        setExtractedData(result.data);
        toast.success('✨ Персона извлечена!');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Ошибка извлечения персоны:', error);
      toast.error(error.message || 'Не удалось извлечь персону. Проверьте подключение к боту.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!extractedData) return;

    const name = window.prompt('Введите имя персонажа:', 'Новый персонаж');
    if (!name || name.trim().length === 0) {
      toast.error('❌ Имя не может быть пустым');
      return;
    }

    setSaving(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';
      
      // Создаем персонажа через API
      const response = await fetch(`${API_URL}/api/girls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          name: name.trim(),
          origin: 'INSPIRED',
          persona: extractedData.systemPrompt || '',
          bioMemory: extractedData.bioMemory || [],
          starterPhrases: extractedData.starterPhrases || []
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Ошибка сервера: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.ok || !result.data) {
        throw new Error('Неверный формат ответа от сервера');
      }

      // Отслеживание создания персонажа
      track('create_persona', { 
        origin: 'INSPIRED',
        name: name
      });

      toast.success('✨ Персонаж создан! Переходим в чат...');
      
      // Complete quest for creating persona
      questActions.onPersonaCreated();
      
      // Редирект в чат с новым персонажем (используем id)
      setTimeout(() => {
        navigate(`/chats/${result.data.id}`, { state: { girlId: result.data.id } });
      }, 1000);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      toast.error('Не удалось сохранить персонажа: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <p style={{
        color: '#9ca3af',
        marginBottom: '24px',
        fontSize: '1rem'
      }}>
        Вставьте минимум 3 примера диалогов или сообщений, и мы создадим персонажа на их основе
      </p>

      {/* Текстовые поля */}
      {samples.map((sample, i) => (
        <div key={i} style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            color: '#fff',
            marginBottom: '8px',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            Пример {i + 1} <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <textarea
            value={sample}
            onChange={(e) => {
              const newSamples = [...samples];
              newSamples[i] = e.target.value;
              setSamples(newSamples);
            }}
            placeholder={`Пример диалога или сообщения...`}
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '12px',
              background: '#1a1a1f',
              border: '1px solid #2a2a2f',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '0.95rem',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
        </div>
      ))}

      {/* Кнопка "Собрать персону" */}
      <button
        onClick={handleExtract}
        disabled={loading}
        style={{
          width: '100%',
          padding: '16px',
          background: loading ? '#6b7280' : 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: '16px',
          fontSize: '1.1rem',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginTop: '8px',
          transition: 'all 0.3s ease'
        }}
      >
        {loading ? '⏳ Анализируем...' : '🔍 Собрать персону'}
      </button>

      {/* Предпросмотр карточки */}
      {extractedData && (
        <div style={{
          marginTop: '32px',
          animation: 'fadeIn 0.5s ease'
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '20px',
            color: '#8b5cf6',
            textAlign: 'center'
          }}>
            ✨ Предпросмотр персонажа
          </h3>

          {/* Карточка-предпросмотр */}
          <div style={{
            background: 'linear-gradient(135deg, #1a1a1f 0%, #2a2a2f 100%)',
            borderRadius: '24px',
            overflow: 'hidden',
            border: '2px solid #8b5cf6',
            boxShadow: '0 10px 40px rgba(139, 92, 246, 0.4)',
            marginBottom: '24px'
          }}>
            {/* Аватар */}
            <div style={{
              height: '300px',
              background: `url(${avatar}) center/cover`,
              backgroundColor: '#2a2a2f',
              position: 'relative'
            }}>
              {/* Кнопка смены аватара */}
              <button
                onClick={generateAvatar}
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  right: '16px',
                  padding: '10px 16px',
                  background: 'rgba(0,0,0,0.7)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(139, 92, 246, 0.5)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(139, 92, 246, 0.9)';
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(0,0,0,0.7)';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                🎲 Сменить аватар
              </button>
            </div>

            {/* Информация */}
            <div style={{ padding: '24px' }}>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#fff',
                marginBottom: '12px'
              }}>
                Новый персонаж
              </h2>
              
              <p style={{
                fontSize: '1rem',
                color: '#9ca3af',
                marginBottom: '20px',
                lineHeight: '1.6'
              }}>
                {extractedData.systemPrompt?.slice(0, 120)}...
              </p>

              {/* Теги/факты */}
              {extractedData.bioMemory && extractedData.bioMemory.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginBottom: '20px'
                }}>
                  {extractedData.bioMemory.slice(0, 3).map((fact, i) => (
                    <div key={i} style={{
                      padding: '6px 12px',
                      background: 'rgba(139, 92, 246, 0.2)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '20px',
                      color: '#a78bfa',
                      fontSize: '0.85rem',
                      fontWeight: '500'
                    }}>
                      {fact}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Детали (аккордеоны) */}
          <details style={{
            marginBottom: '12px',
            background: '#1a1a1f',
            borderRadius: '12px',
            border: '1px solid #2a2a2f'
          }}>
            <summary style={{
              padding: '12px 16px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#fff',
              listStyle: 'none'
            }}>
              📝 System Prompt
            </summary>
            <div style={{
              padding: '12px 16px',
              color: '#9ca3af',
              fontSize: '0.9rem',
              lineHeight: '1.6',
              borderTop: '1px solid #2a2a2f'
            }}>
              {extractedData.systemPrompt || 'Не указано'}
            </div>
          </details>

          <details style={{
            marginBottom: '12px',
            background: '#1a1a1f',
            borderRadius: '12px',
            border: '1px solid #2a2a2f'
          }}>
            <summary style={{
              padding: '12px 16px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#fff',
              listStyle: 'none'
            }}>
              💬 Starter Phrases ({extractedData.starterPhrases?.length || 0})
            </summary>
            <div style={{
              padding: '12px 16px',
              borderTop: '1px solid #2a2a2f'
            }}>
              {extractedData.starterPhrases?.map((phrase, i) => (
                <div key={i} style={{
                  padding: '10px',
                  marginBottom: '8px',
                  background: '#0b0b10',
                  borderRadius: '8px',
                  color: '#e5e7eb',
                  fontSize: '0.9rem'
                }}>
                  "{phrase}"
                </div>
              ))}
            </div>
          </details>

          {/* Кнопка "Оживить" с анимацией */}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%',
              padding: '18px',
              background: saving 
                ? '#6b7280' 
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '20px',
              fontSize: '1.2rem',
              fontWeight: '700',
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: saving 
                ? 'none'
                : '0 8px 25px rgba(16, 185, 129, 0.5)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (!saving) {
                e.target.style.transform = 'scale(1.02)';
                e.target.style.boxShadow = '0 12px 35px rgba(16, 185, 129, 0.6)';
              }
            }}
            onMouseLeave={(e) => {
              if (!saving) {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.5)';
              }
            }}
          >
            {saving ? '💾 Сохраняем...' : '✨ Оживить персонажа'}
            
            {/* Glow эффект */}
            {!saving && (
              <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                animation: 'glow 3s ease-in-out infinite',
                pointerEvents: 'none'
              }} />
            )}
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes glow {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

