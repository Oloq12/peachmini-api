import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { pb } from '../services/pb';
import ChatList from '../components/chat/ChatList';

export default function Chats() {
  const location = useLocation();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChats();
    
    // Если передан новый персонаж, показываем уведомление
    if (location.state?.newCharacterId) {
      loadNewCharacter(location.state.newCharacterId);
    }
  }, [location.state]);

  const loadChats = async () => {
    setLoading(true);
    try {
      if (!pb) {
        setChats([]);
        return;
      }

      // Загружаем персонажей из girls
      const girls = await pb.collection('girls').getList(1, 50, {
        sort: '-created'
      });

      // Для каждого персонажа пытаемся получить последнее сообщение
      const chatList = await Promise.all(
        girls.items.map(async (girl) => {
          try {
            // Пытаемся получить последнее сообщение из коллекции messages
            const lastMessage = await pb.collection('messages').getList(1, 1, {
              filter: `girlId = "${girl.id}"`,
              sort: '-created'
            });

            const lastMsg = lastMessage.items[0];
            const lastTime = lastMsg 
              ? new Date(lastMsg.created).toLocaleTimeString('ru', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })
              : 'новый';

            return {
              girlId: girl.id,
              name: girl.name,
              avatar: girl.avatar,
              lastMessage: lastMsg?.content || 'Начните диалог...',
              lastTime
            };
          } catch (err) {
            // Если нет сообщений или коллекции, возвращаем базовую информацию
            return {
              girlId: girl.id,
              name: girl.name,
              avatar: girl.avatar,
              lastMessage: 'Начните диалог...',
              lastTime: 'новый'
            };
          }
        })
      );

      setChats(chatList);
    } catch (error) {
      console.error('Ошибка загрузки чатов:', error);
      toast.error('Не удалось загрузить чаты');
    } finally {
      setLoading(false);
    }
  };

  const loadNewCharacter = async (characterId) => {
    try {
      if (!pb) return;

      const character = await pb.collection('girls').getOne(characterId);
      toast.success(`Персонаж ${character.name} готов к общению!`, {
        duration: 4000
      });
    } catch (error) {
      console.error('Ошибка загрузки персонажа:', error);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      paddingBottom: '70px',
      background: '#0b0b10'
    }}>
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#1a1a1f',
            color: '#fff',
            borderRadius: '12px'
          }
        }}
      />
      
      <div style={{
        padding: '20px',
        background: '#1a1a1f',
        borderBottom: '1px solid #2a2a2f'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: '#fff',
          margin: 0
        }}>
          Чаты
        </h1>
      </div>

      <ChatList chats={chats} loading={loading} />
    </div>
  );
}
