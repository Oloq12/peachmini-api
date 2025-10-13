import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from '../Toast';
import { pb, sendChatMessage, getCharacterBySlug } from '../../services/pb';
import UpgradeModal from './UpgradeModal';
import { track } from '../../utils/analytics';
import { ChatMessageSkeleton } from '../Skeleton';
import { questActions } from '../../utils/questTracker';

export default function ChatScreen() {
  const { girlId } = useParams();
  const navigate = useNavigate();
  
  const [character, setCharacter] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [userBalance, setUserBalance] = useState(null);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadChat();
  }, [girlId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChat = async () => {
    try {
      setLoading(true);
      
      // Загружаем персонажа через API (используем girlId как slug для простоты)
      const girl = await pb.collection('girls').getOne(girlId).catch(async () => {
        // Если не найден по ID, попробуем найти по slug
        const API_URL = import.meta.env.VITE_API_URL || 'https://unrazed-wendell-pseudocentric.ngrok-free.dev';
        const response = await fetch(`${API_URL}/girls/${girlId}`, {
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        });
        if (!response.ok) throw new Error('Character not found');
        const data = await response.json();
        return data.girl;
      });
      setCharacter(girl);

      // Загружаем историю сообщений (если есть коллекция)
      try {
        const messageRecords = await pb.collection('messages').getList(1, 50, {
          filter: `girlId = "${girlId}"`,
          sort: 'created'
        });
        
        const formattedMessages = messageRecords.items.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.created).getTime()
        }));
        
        setMessages(formattedMessages);
      } catch (err) {
        console.log('Коллекция messages не найдена, начинаем с пустой истории');
        setMessages([]);
      }
      
    } catch (error) {
      console.error('Ошибка загрузки чата:', error);
      toast.error('Не удалось загрузить чат');
      navigate('/chats');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || sending || !character) return;

    const userMessage = inputText.trim();
    setInputText('');
    
    // Добавляем сообщение пользователя
    const newUserMsg = {
      role: 'user',
      content: userMessage,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, newUserMsg]);
    
    setSending(true);

    try {
      // Отправляем сообщение через API
      const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 'demo';
      const result = await sendChatMessage(character.id, userMessage, userId);
      
      // Обновляем баланс если пришел в ответе
      if (typeof result.balance === 'number') {
        setUserBalance(result.balance);
      }

      // Отслеживание отправки сообщения
      track('send_message', { 
        characterId: character.id,
        characterName: character.name,
        messageLength: userMessage.length
      });

      // Добавляем ответ бота
      const botMessage = {
        role: 'assistant',
        content: result.reply,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMessage]);

      // Сохраняем сообщения в PocketBase (если есть коллекция)
      try {
        if (pb) {
          await pb.collection('messages').create({
            girlId: character.id,
            role: 'user',
            content: userMessage
          });
          
          await pb.collection('messages').create({
            girlId: character.id,
            role: 'assistant',
            content: data.reply
          });
        }
      } catch (err) {
        console.log('Не удалось сохранить в messages:', err);
      }
      
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      
      if (error.message === 'NO_FUNDS') {
        toast.error('💎 Недостаточно средств! Пополните баланс', {
          duration: 4000
        });
        setShowUpgradeModal(true);
      } else {
        toast.error('Не удалось отправить сообщение');
      }
      
      // Удаляем сообщение пользователя при ошибке
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('ru', { 
        day: 'numeric', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: '#0b0b10'
      }}>
        {/* Header Skeleton */}
        <div style={{
          padding: '16px 20px',
          background: '#1a1a1f',
          borderBottom: '1px solid #2a2a2f'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              background: '#2a2a2f' 
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ 
                width: '120px', 
                height: '18px', 
                borderRadius: '4px', 
                background: '#2a2a2f', 
                marginBottom: '4px' 
              }} />
              <div style={{ 
                width: '180px', 
                height: '14px', 
                borderRadius: '4px', 
                background: '#2a2a2f' 
              }} />
            </div>
          </div>
        </div>

        {/* Messages Skeleton */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px'
        }}>
          <ChatMessageSkeleton />
          <div style={{ marginTop: '12px' }}>
            <ChatMessageSkeleton />
          </div>
          <div style={{ marginTop: '12px' }}>
            <ChatMessageSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (!character) return null;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: '#0b0b10'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        background: '#1a1a1f',
        borderBottom: '1px solid #2a2a2f',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <button
          onClick={() => navigate('/chats')}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#8b5cf6',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          ←
        </button>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: `url(${character.avatar}) center/cover`,
          backgroundColor: '#2a2a2f'
        }} />
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: '600',
            color: '#fff',
            margin: 0
          }}>
            {character.name}
          </h3>
          <p style={{
            fontSize: '0.85rem',
            color: '#9ca3af',
            margin: 0
          }}>
            {character.shortDesc}
          </p>
        </div>
        
        {/* Баланс */}
        {userBalance !== null && (
          <div style={{
            padding: '6px 12px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ fontSize: '1rem' }}>💎</span>
            <span style={{
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#fff'
            }}>
              {userBalance}
            </span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        paddingBottom: '120px'
      }}>
        {messages.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#9ca3af'
          }}>
            <p>Начните диалог с {character.name}</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '12px'
            }}
          >
            <div style={{
              maxWidth: '75%',
              padding: '12px 16px',
              borderRadius: '16px',
              background: msg.role === 'user' 
                ? 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)'
                : '#1a1a1f',
              color: '#fff',
              wordWrap: 'break-word'
            }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>
                {msg.content}
              </p>
              <span style={{
                fontSize: '0.7rem',
                color: msg.role === 'user' ? 'rgba(255,255,255,0.7)' : '#6b7280',
                marginTop: '4px',
                display: 'block'
              }}>
                {formatTime(msg.timestamp)}
              </span>
            </div>
          </div>
        ))}
        
        {sending && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start',
            marginBottom: '12px'
          }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: '16px',
              background: '#1a1a1f',
              color: '#9ca3af'
            }}>
              Печатает...
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        position: 'fixed',
        bottom: '70px',
        left: 0,
        right: 0,
        padding: '12px 20px',
        background: '#0b0b10',
        borderTop: '1px solid #2a2a2f'
      }}>
        <div style={{
          display: 'flex',
          gap: '12px',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Напишите сообщение..."
            disabled={sending}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: '#1a1a1f',
              border: '1px solid #2a2a2f',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '0.95rem',
              outline: 'none'
            }}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || sending}
            style={{
              padding: '12px 20px',
              background: inputText.trim() && !sending
                ? 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)'
                : '#2a2a2f',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.2rem',
              cursor: inputText.trim() && !sending ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease'
            }}
          >
            {sending ? '⏳' : '➤'}
          </button>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal onClose={() => setShowUpgradeModal(false)} />
      )}
    </div>
  );
}

