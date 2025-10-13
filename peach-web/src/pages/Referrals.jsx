import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

export default function Referrals() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      
      // Get Telegram user ID
      const tg = window.Telegram?.WebApp;
      const userId = tg?.initDataUnsafe?.user?.id || 'demo';
      const botUsername = tg?.initDataUnsafe?.user?.username || 'Amourath_ai_bot';
      
      console.log('🔵 Fetching referral data for tgId:', userId);
      
      const response = await fetch(`${API_URL}/api/ref/status?tgId=${userId}`, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      const result = await response.json();
      
      console.log('📥 API Response:', result);
      
      if (result.ok && result.data) {
        const referralLink = `https://t.me/${botUsername}?start=ref_${result.data.referralCode}`;
        
        setData({
          referralLink,
          referralCode: result.data.referralCode,
          stats: {
            count: result.data.refCount,
            earned: result.data.earned,
            balance: result.data.balance
          },
          referrals: [] // TODO: получать список рефералов из API
        });
        
        console.log('✅ Referral data loaded:', result.data);
      } else {
        console.error('Failed to fetch referral data:', result.error);
        // Show empty state
        setData({
          referralLink: `https://t.me/${botUsername}`,
          referralCode: 'N/A',
          stats: { count: 0, earned: 0, balance: 0 },
          referrals: []
        });
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
      // Show empty state
      setData({
        referralLink: 'https://t.me/Amourath_ai_bot',
        referralCode: 'N/A',
        stats: { count: 0, earned: 0, balance: 0 },
        referrals: []
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      if (data?.referralLink) {
        await navigator.clipboard.writeText(data.referralLink);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    } catch (error) {
      // Fallback для старых браузеров
      const textArea = document.createElement('textarea');
      textArea.value = data?.referralLink || '';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b10] flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  const isNotRegistered = data?.referralCode === 'N/A';

  return (
    <div className="min-h-screen bg-[#0b0b10] text-white p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🔗 Реферальная программа</h1>
        <p className="text-gray-400">Приглашайте друзей и зарабатывайте PeachPoints!</p>
      </div>

      {/* Warning if not registered */}
      {isNotRegistered && (
        <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="text-3xl">⚠️</div>
            <div>
              <div className="font-bold mb-1">Начните работу с ботом</div>
              <div className="text-sm text-gray-300 mb-2">
                Для активации реферальной программы отправьте команду /start или /ref в боте @Amourath_ai_bot
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-600/20 to-purple-900/20 border border-purple-500/30 rounded-2xl p-4">
          <div className="text-gray-400 text-sm mb-1">Приглашено</div>
          <div className="text-3xl font-bold">{data.stats.count}</div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-900/20 border border-yellow-500/30 rounded-2xl p-4">
          <div className="text-gray-400 text-sm mb-1">Заработано</div>
          <div className="text-3xl font-bold">{data.stats.earned} PP</div>
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-green-600/20 to-green-900/20 border border-green-500/30 rounded-2xl p-4 mb-6">
        <div className="text-gray-400 text-sm mb-1">💎 Ваш баланс</div>
        <div className="text-3xl font-bold">{data.stats.balance} PeachPoints</div>
      </div>

      {/* Referral Link */}
      <div className="bg-[#1a1a24] border border-gray-700 rounded-2xl p-4 mb-6">
        <div className="text-gray-400 text-sm mb-2">Ваша реферальная ссылка:</div>
        <div className="bg-[#0b0b10] border border-gray-600 rounded-xl p-3 mb-3 break-all text-sm">
          {data.referralLink}
        </div>
        <button
          onClick={copyToClipboard}
          className={`w-full py-3 rounded-xl font-bold transition-all ${
            copySuccess
              ? 'bg-green-500 text-white'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          {copySuccess ? '✓ Скопировано!' : '📋 Скопировать ссылку'}
        </button>
      </div>

      {/* Bonus Info */}
      <div className="bg-blue-600/20 border border-blue-500/30 rounded-2xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="text-3xl">💰</div>
          <div>
            <div className="font-bold mb-1">+100 PeachPoints за каждого друга</div>
            <div className="text-sm text-gray-300">
              Ваш друг регистрируется по вашей ссылке, и вы автоматически получаете бонус!
            </div>
          </div>
        </div>
      </div>

      {/* Referrals List */}
      <div className="bg-[#1a1a24] border border-gray-700 rounded-2xl p-4">
        <h2 className="text-xl font-bold mb-4">👥 Последние приглашения</h2>
        
        {data.referrals && data.referrals.length > 0 ? (
          <div className="space-y-2">
            {data.referrals.map((ref, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-[#0b0b10] border border-gray-700 rounded-xl p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-900 rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">Пользователь {ref.tgId}</div>
                    <div className="text-sm text-gray-400">{formatDate(ref.date)}</div>
                  </div>
                </div>
                <div className="text-green-400 font-bold">+100 PP</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">👋</div>
            <div>Пока никто не присоединился</div>
            <div className="text-sm mt-1">Поделитесь своей ссылкой!</div>
          </div>
        )}
      </div>
    </div>
  );
}

