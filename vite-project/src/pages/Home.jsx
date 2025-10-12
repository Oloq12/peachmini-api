import React from 'react';

const Home = () => {
  return (
    <div className="min-h-screen p-4 pt-6">
      {/* Заголовок */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          Привет! 👋
        </h1>
        <p className="text-gray-400">Добро пожаловать в AI Companions</p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-background-secondary rounded-2xl p-4 text-center border border-gray-800">
          <div className="text-2xl font-bold text-primary">12</div>
          <div className="text-xs text-gray-400 mt-1">Companions</div>
        </div>
        <div className="bg-background-secondary rounded-2xl p-4 text-center border border-gray-800">
          <div className="text-2xl font-bold text-primary">48</div>
          <div className="text-xs text-gray-400 mt-1">Chats</div>
        </div>
        <div className="bg-background-secondary rounded-2xl p-4 text-center border border-gray-800">
          <div className="text-2xl font-bold text-primary">⭐ 100</div>
          <div className="text-xs text-gray-400 mt-1">Credits</div>
        </div>
      </div>

      {/* Популярные компаньоны */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Популярные</h2>
          <button className="text-primary text-sm">Смотреть все →</button>
        </div>
        
        <div className="space-y-3">
          {[
            { name: 'Анна', description: 'Твоя подруга по переписке', avatar: '👩', online: true },
            { name: 'Мария', description: 'Романтичная натура', avatar: '💃', online: true },
            { name: 'Катя', description: 'Спортсменка и активная', avatar: '🏃‍♀️', online: false },
          ].map((companion, index) => (
            <div
              key={index}
              className="bg-background-secondary rounded-2xl p-4 border border-gray-800 hover:border-primary/50 transition-all cursor-pointer"
            >
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center text-2xl">
                    {companion.avatar}
                  </div>
                  {companion.online && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-background-secondary"></div>
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-semibold">{companion.name}</h3>
                  <p className="text-sm text-gray-400">{companion.description}</p>
                </div>
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Быстрые действия */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-gradient-to-br from-primary to-purple-600 rounded-2xl p-4 text-left hover:scale-105 transition-transform">
            <div className="text-2xl mb-2">✨</div>
            <div className="font-semibold">Создать нового</div>
            <div className="text-xs text-purple-200 mt-1">Персонажа</div>
          </button>
          <button className="bg-background-secondary rounded-2xl p-4 text-left border border-gray-800 hover:border-primary/50 transition-all">
            <div className="text-2xl mb-2">💬</div>
            <div className="font-semibold">Последний чат</div>
            <div className="text-xs text-gray-400 mt-1">Продолжить</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;

