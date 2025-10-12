import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from '../Toast';
import { pb } from '../../services/pb';
import { track } from '../../utils/analytics';

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
  const [showAccordions, setShowAccordions] = useState({
    systemPrompt: false,
    bioMemory: false,
    starterPhrases: false
  });

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
    // Валидация
    const filledSamples = samples.filter(s => s.trim().length > 0);
    
    if (filledSamples.length < 2) {
      toast.error('Заполните минимум 2 примера диалогов');
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ samples: filledSamples })
      });

      if (!response.ok) {
        throw new Error('Ошибка сервера');
      }

      const data = await response.json();
      setExtractedData(data);
      toast.success('Персона извлечена!');
    } catch (error) {
      console.error('Ошибка извлечения персоны:', error);
      toast.error('Не удалось извлечь персону. Проверьте подключение к боту.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!extractedData) return;

    const name = window.prompt('Введите имя персонажа:', 'Новый персонаж');
    if (!name) return;

    setSaving(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';
      
      // Создаем персонажа через API
      const response = await fetch(`${API_URL}/girls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          name,
          origin: 'INSPIRED',
          persona: extractedData.systemPrompt || '',
          bioMemory: extractedData.bioMemory || [],
          starterPhrases: extractedData.starterPhrases || []
        })
      });

      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.ok || !data.slug) {
        throw new Error('Неверный формат ответа от сервера');
      }

      // Отслеживание создания персонажа
      track('persona_created', { origin: 'INSPIRED' });

      toast.success('✨ Персонаж создан! Переходим в чат...');
      
      // Редирект в чат с новым персонажем (используем slug)
      setTimeout(() => {
        navigate(`/chats/${data.id}`, { state: { girlId: data.id } });
      }, 800);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      toast.error('Не удалось сохранить персонажа: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleAccordion = (key) => {
    setShowAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <p style={{
        color: '#9ca3af',
        marginBottom: '24px',
        fontSize: '1rem'
      }}>
        Вставьте 2-3 примера диалогов или сообщений, и мы создадим персонажа на их основе
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
            Пример {i + 1} {i < 2 && <span style={{ color: '#ef4444' }}>*</span>}
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

      {/* Предпросмотр */}
      {extractedData && (
        <div style={{
          marginTop: '32px',
          padding: '20px',
          background: '#1a1a1f',
          borderRadius: '16px',
          border: '1px solid #2a2a2f'
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '16px',
            color: '#8b5cf6'
          }}>
            ✅ Персона готова
          </h3>

          {/* Предпросмотр аватара */}
          <div style={{
            marginBottom: '20px',
            padding: '16px',
            background: '#0b0b10',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <img
              src={avatar}
              alt="Avatar preview"
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid #8b5cf6'
              }}
            />
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: '0.9rem',
                color: '#9ca3af',
                marginBottom: '8px'
              }}>
                Текущий аватар персонажа
              </p>
              <button
                onClick={generateAvatar}
                style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                🎲 Сгенерировать новый
              </button>
            </div>
          </div>

          {/* Аккордеон: System Prompt */}
          <div style={{ marginBottom: '12px' }}>
            <button
              onClick={() => toggleAccordion('systemPrompt')}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: '#2a2a2f',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              <span>📝 System Prompt</span>
              <span>{showAccordions.systemPrompt ? '▼' : '▶'}</span>
            </button>
            {showAccordions.systemPrompt && (
              <div style={{
                padding: '12px',
                background: '#0b0b10',
                borderRadius: '0 0 12px 12px',
                marginTop: '4px',
                color: '#9ca3af',
                fontSize: '0.9rem',
                whiteSpace: 'pre-wrap'
              }}>
                {extractedData.systemPrompt || 'Не указано'}
              </div>
            )}
          </div>

          {/* Аккордеон: Bio Memory */}
          <div style={{ marginBottom: '12px' }}>
            <button
              onClick={() => toggleAccordion('bioMemory')}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: '#2a2a2f',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              <span>🧠 Bio Memory ({extractedData.bioMemory?.length || 0})</span>
              <span>{showAccordions.bioMemory ? '▼' : '▶'}</span>
            </button>
            {showAccordions.bioMemory && (
              <div style={{
                padding: '12px',
                background: '#0b0b10',
                borderRadius: '0 0 12px 12px',
                marginTop: '4px'
              }}>
                {extractedData.bioMemory?.map((item, i) => (
                  <div key={i} style={{
                    padding: '8px',
                    marginBottom: '8px',
                    background: '#1a1a1f',
                    borderRadius: '8px',
                    color: '#9ca3af',
                    fontSize: '0.9rem'
                  }}>
                    {item}
                  </div>
                )) || 'Нет данных'}
              </div>
            )}
          </div>

          {/* Аккордеон: Starter Phrases */}
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={() => toggleAccordion('starterPhrases')}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: '#2a2a2f',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              <span>💬 Starter Phrases ({extractedData.starterPhrases?.length || 0})</span>
              <span>{showAccordions.starterPhrases ? '▼' : '▶'}</span>
            </button>
            {showAccordions.starterPhrases && (
              <div style={{
                padding: '12px',
                background: '#0b0b10',
                borderRadius: '0 0 12px 12px',
                marginTop: '4px'
              }}>
                {extractedData.starterPhrases?.map((phrase, i) => (
                  <div key={i} style={{
                    padding: '8px',
                    marginBottom: '8px',
                    background: '#1a1a1f',
                    borderRadius: '8px',
                    color: '#9ca3af',
                    fontSize: '0.9rem'
                  }}>
                    {phrase}
                  </div>
                )) || 'Нет данных'}
              </div>
            )}
          </div>

          {/* Кнопка "Оживить" */}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%',
              padding: '16px',
              background: saving ? '#6b7280' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '16px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
            }}
          >
            {saving ? '💾 Сохраняем...' : '✨ Оживить персонажа'}
          </button>
        </div>
      )}
    </div>
  );
}

