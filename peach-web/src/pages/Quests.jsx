import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
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
      const tgId = tg?.initDataUnsafe?.user?.id || 'demo';
      
      console.log('🔵 Fetching quests for tgId:', tgId);
      
      const response = await fetch(`${API_URL}/api/quests/status?tgId=${tgId}`, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      const result = await response.json();
      
      console.log('📥 Quests API response:', result);
      
      if (result.ok && result.data) {
        setData(result.data);
      } else {
        console.error('Failed to fetch quests data:', result.error);
        setData({
          tasks: [],
          totals: { done: 0, all: 0, earned: 0 }
        });
      }
    } catch (error) {
      console.error('Error fetching quests data:', error);
      setData({
        tasks: [],
        totals: { done: 0, all: 0, earned: 0 }
      });
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

  const handleCompleteQuest = async (key) => {
    try {
      setProcessingQuest(key);
      
      const tg = window.Telegram?.WebApp;
      const tgId = tg?.initDataUnsafe?.user?.id || 'demo';
      
      console.log('🔵 Completing quest:', key);
      
      const response = await fetch(`${API_URL}/api/quests/complete`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ tgId, key })
      });
      
      const result = await response.json();
      
      console.log('📥 Complete response:', result);
      
      if (result.ok && result.data) {
        if (result.data.alreadyCompleted) {
          toast.success('✅ Квест уже выполнен!');
        } else {
          const reward = result.data.reward || 0;
          
          // Отслеживание выполнения квеста
          track('quest_completed', { 
            key,
            reward
          });

          toast.success(`+${reward} 💎`, {
            duration: 3000,
            style: {
              background: '#10b981',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '1.2rem'
            }
          });
          
          // Refresh data
          await fetchQuestsData();
        }
      } else {
        toast.error('❌ Ошибка при выполнении квеста');
      }
    } catch (error) {
      console.error('Complete quest error:', error);
      toast.error('❌ Произошла ошибка');
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
      <div className="min-h-screen bg-[#0b0b10] flex items-center justify-center pb-24">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  const tasks = data?.tasks || [];
  const totals = data?.totals || { done: 0, all: 0, earned: 0 };

  return (
    <div className="min-h-screen bg-[#0b0b10] text-white p-6 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🎯 Квесты</h1>
        <p className="text-gray-400">Выполняйте задания и получайте награды!</p>
      </div>

      {/* Progress Card */}
      <div className="bg-gradient-to-br from-purple-600/20 to-purple-900/20 border border-purple-500/30 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-gray-400 text-sm mb-1">Прогресс</div>
            <div className="text-3xl font-bold">
              {totals.done} / {totals.all}
            </div>
          </div>
          <div className="text-5xl">📊</div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-700 rounded-full h-3 mb-3">
          <div 
            className="bg-gradient-to-r from-purple-600 to-purple-400 h-3 rounded-full transition-all"
            style={{ width: `${totals.all > 0 ? (totals.done / totals.all * 100) : 0}%` }}
          />
        </div>
        
        <div className="text-sm text-gray-300">
          💰 Заработано: <span className="font-bold text-yellow-400">{totals.earned} PP</span>
        </div>
      </div>

      {/* Tasks List */}
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-4">📋 Задания</h2>
        
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.key}
              className={`bg-[#1a1a24] border rounded-2xl p-4 transition-all ${
                task.done
                  ? 'border-green-500/30 bg-green-900/10'
                  : 'border-gray-700 hover:border-purple-500/50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  {/* Checkbox/Icon */}
                  <div className="mt-1">
                    {task.done ? (
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">
                        ✓
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-600" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-bold mb-1 flex items-center gap-2">
                      <span>{task.icon}</span>
                      <span className={task.done ? 'line-through text-gray-500' : ''}>
                        {task.title}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">{task.description}</div>
                  </div>
                </div>
                
                <div className={`text-lg font-bold ml-3 ${task.done ? 'text-green-400' : 'text-yellow-400'}`}>
                  +{task.reward} PP
                </div>
              </div>
              
              {!task.done && (
                <button
                  onClick={() => handleCompleteQuest(task.key)}
                  disabled={processingQuest === task.key}
                  className={`w-full py-2.5 rounded-xl font-medium transition-all text-sm ${
                    processingQuest === task.key
                      ? 'bg-purple-700 text-white'
                      : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white'
                  }`}
                >
                  {processingQuest === task.key ? '⏳ Обработка...' : '🎯 Отметить выполненным'}
                </button>
              )}
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

function getQuestIcon(key) {
  const icons = {
    open_app: '🚀',
    create_persona: '✨',
    start_chat: '💬'
  };
  return icons[key] || '📌';
}

function getQuestDescription(key) {
  const descriptions = {
    open_app: 'Откройте WebApp приложение',
    create_persona: 'Создайте своего первого персонажа',
    start_chat: 'Отправьте первое сообщение персонажу'
  };
  return descriptions[key] || 'Выполните задание для получения награды';
}


