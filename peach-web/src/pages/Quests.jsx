import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { track } from '../utils/analytics';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

export default function Quests() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [processingQuest, setProcessingQuest] = useState(null);

  useEffect(() => {
    fetchQuestsData();
  }, []);

  const fetchQuestsData = async () => {
    try {
      setLoading(true);
      
      const tg = window.Telegram?.WebApp;
      const tgId = tg?.initDataUnsafe?.user?.id;
      
      if (!tgId) {
        console.error('No Telegram user ID available');
        setData({
          streak: 0,
          canCheckinToday: false,
          quests: []
        });
        return;
      }
      
      const response = await fetch(`${API_URL}/quests/status?tgId=${tgId}`);
      const result = await response.json();
      
      if (result.ok) {
        setData(result);
      } else {
        console.error('Failed to fetch quests data:', result.error);
      }
    } catch (error) {
      console.error('Error fetching quests data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckin = async () => {
    try {
      setProcessingQuest('daily_checkin');
      
      const tg = window.Telegram?.WebApp;
      const tgId = tg?.initDataUnsafe?.user?.id;
      
      if (!tgId) {
        showToast('⚠️ Ошибка: не удалось получить ID пользователя');
        return;
      }
      
      const response = await fetch(`${API_URL}/quests/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tgId })
      });
      
      const result = await response.json();
      
      if (result.ok) {
        if (result.alreadyCheckedIn) {
          showToast('✅ Вы уже получили награду сегодня!');
        } else {
          // Отслеживание получения награды
          track('quest_claimed', { 
            code: 'daily_checkin',
            reward: 20,
            streak: result.streak || 1
          });

          showToast(`🎉 ${result.message}`);
          // Refresh data
          await fetchQuestsData();
        }
      } else {
        showToast('❌ Ошибка при получении награды');
      }
    } catch (error) {
      console.error('Checkin error:', error);
      showToast('❌ Произошла ошибка');
    } finally {
      setProcessingQuest(null);
    }
  };

  const handleCompleteQuest = async (code) => {
    try {
      setProcessingQuest(code);
      
      const tg = window.Telegram?.WebApp;
      const tgId = tg?.initDataUnsafe?.user?.id;
      
      if (!tgId) {
        showToast('⚠️ Ошибка: не удалось получить ID пользователя');
        return;
      }
      
      const response = await fetch(`${API_URL}/quests/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tgId, code })
      });
      
      const result = await response.json();
      
      if (result.ok) {
        if (result.alreadyCompleted) {
          showToast('✅ Квест уже выполнен!');
        } else {
          // Отслеживание выполнения квеста
          track('quest_claimed', { 
            code,
            reward: result.reward || 0
          });

          showToast(`🎉 ${result.message}`);
          // Refresh data
          await fetchQuestsData();
        }
      } else {
        showToast('❌ Ошибка при выполнении квеста');
      }
    } catch (error) {
      console.error('Complete quest error:', error);
      showToast('❌ Произошла ошибка');
    } finally {
      setProcessingQuest(null);
    }
  };

  const showToast = (message) => {
    const tg = window.Telegram?.WebApp;
    if (tg?.showAlert) {
      tg.showAlert(message);
    } else {
      alert(message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b10] flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  const dailyCheckin = data?.quests?.find(q => q.code === 'daily_checkin');
  const otherQuests = data?.quests?.filter(q => q.code !== 'daily_checkin') || [];

  return (
    <div className="min-h-screen bg-[#0b0b10] text-white p-6 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🎯 Квесты</h1>
        <p className="text-gray-400">Выполняйте задания и получайте награды!</p>
      </div>

      {/* Streak Card */}
      <div className="bg-gradient-to-br from-orange-600/20 to-red-900/20 border border-orange-500/30 rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-gray-400 text-sm mb-1">Ваш стрик</div>
            <div className="text-3xl font-bold flex items-center gap-2">
              🔥 {data?.streak || 0} {data?.streak === 1 ? 'день' : data?.streak < 5 ? 'дня' : 'дней'}
            </div>
          </div>
          <div className="text-5xl">🔥</div>
        </div>
      </div>

      {/* Daily Check-in Card */}
      {dailyCheckin && (
        <div className="bg-gradient-to-br from-purple-600/20 to-purple-900/20 border border-purple-500/30 rounded-2xl p-5 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-xl font-bold mb-1">📅 {dailyCheckin.title}</div>
              <div className="text-gray-400 text-sm">Заходите каждый день для получения награды</div>
            </div>
            <div className="text-2xl font-bold text-yellow-400">+{dailyCheckin.reward} PP</div>
          </div>
          
          <button
            onClick={handleCheckin}
            disabled={!dailyCheckin.canClaim || processingQuest === 'daily_checkin'}
            className={`w-full py-3 rounded-xl font-bold transition-all ${
              !dailyCheckin.canClaim
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : processingQuest === 'daily_checkin'
                ? 'bg-purple-700 text-white'
                : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white'
            }`}
          >
            {processingQuest === 'daily_checkin'
              ? '⏳ Обработка...'
              : !dailyCheckin.canClaim
              ? '✅ Выполнено сегодня'
              : '🎁 Забрать +20 PP'}
          </button>
        </div>
      )}

      {/* Other Quests */}
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-4">📋 Задания</h2>
        
        <div className="space-y-3">
          {otherQuests.map((quest) => (
            <div
              key={quest.code}
              className={`bg-[#1a1a24] border rounded-2xl p-4 transition-all ${
                quest.status === 'done'
                  ? 'border-green-500/30 opacity-70'
                  : 'border-gray-700 hover:border-purple-500/50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="font-bold mb-1">{getQuestIcon(quest.code)} {quest.title}</div>
                  <div className="text-sm text-gray-400">{getQuestDescription(quest.code)}</div>
                </div>
                <div className="text-lg font-bold text-yellow-400 ml-3">+{quest.reward} PP</div>
              </div>
              
              <button
                onClick={() => handleCompleteQuest(quest.code)}
                disabled={quest.status === 'done' || processingQuest === quest.code}
                className={`w-full py-2.5 rounded-xl font-medium transition-all text-sm ${
                  quest.status === 'done'
                    ? 'bg-green-600/20 text-green-400 cursor-not-allowed'
                    : processingQuest === quest.code
                    ? 'bg-blue-700 text-white'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                }`}
              >
                {processingQuest === quest.code
                  ? '⏳ Обработка...'
                  : quest.status === 'done'
                  ? '✅ Выполнено'
                  : '🎯 Выполнить'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-600/20 border border-blue-500/30 rounded-2xl p-4 mt-6">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div className="text-sm text-gray-300">
            <div className="font-bold mb-1">Совет</div>
            Некоторые квесты выполняются автоматически при использовании приложения. 
            Проверяйте эту страницу регулярно для получения наград!
          </div>
        </div>
      </div>
    </div>
  );
}

function getQuestIcon(code) {
  const icons = {
    first_chat: '💬',
    create_persona: '✨',
    invite_friend: '👥'
  };
  return icons[code] || '📌';
}

function getQuestDescription(code) {
  const descriptions = {
    first_chat: 'Отправьте первое сообщение персонажу',
    create_persona: 'Создайте своего первого персонажа',
    invite_friend: 'Пригласите друга через реферальную ссылку'
  };
  return descriptions[code] || 'Выполните задание для получения награды';
}

