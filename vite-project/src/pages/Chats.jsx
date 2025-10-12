import React, { useState } from 'react';

const Chats = () => {
  const [filter, setFilter] = useState('all'); // all, active, archived

  const chats = [
    { id: 1, name: 'Анна', lastMessage: 'Привет! Как дела? 😊', time: '10:30', unread: 2, avatar: '👩', online: true },
    { id: 2, name: 'Мария', lastMessage: 'Спасибо за вчерашний вечер!', time: '09:15', unread: 0, avatar: '💃', online: true },
    { id: 3, name: 'Катя', lastMessage: 'Пойдём завтра на пробежку?', time: 'Вчера', unread: 0, avatar: '🏃‍♀️', online: false },
    { id: 4, name: 'София', lastMessage: 'Ты смотрел тот фильм?', time: 'Вчера', unread: 5, avatar: '🎬', online: true },
    { id: 5, name: 'Лиза', lastMessage: 'До встречи! ❤️', time: '2 дня назад', unread: 0, avatar: '❤️', online: false },
  ];

  return (
    <div className="min-h-screen">
      {/* Заголовок и поиск */}
      <div className="sticky top-0 bg-background z-10 p-4 pt-6 pb-3">
        <h1 className="text-3xl font-bold mb-4">Чаты</h1>
        
        {/* Поиск */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Поиск чатов..."
            className="w-full bg-background-secondary rounded-2xl py-3 px-4 pl-11 border border-gray-800 focus:border-primary focus:outline-none transition-colors"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Фильтры */}
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'Все' },
            { key: 'active', label: 'Активные' },
            { key: 'archived', label: 'Архив' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === item.key
                  ? 'bg-primary text-white'
                  : 'bg-background-secondary text-gray-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Список чатов */}
      <div className="px-4 pb-4">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className="bg-background-secondary rounded-2xl p-4 mb-3 border border-gray-800 hover:border-primary/50 transition-all cursor-pointer active:scale-98"
          >
            <div className="flex items-center">
              {/* Аватар */}
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center text-2xl">
                  {chat.avatar}
                </div>
                {chat.online && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-background-secondary"></div>
                )}
              </div>

              {/* Контент */}
              <div className="ml-4 flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold truncate">{chat.name}</h3>
                  <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{chat.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-400 truncate">{chat.lastMessage}</p>
                  {chat.unread > 0 && (
                    <div className="ml-2 flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold">
                      {chat.unread}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Пустое состояние (если нет чатов) */}
      {chats.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-semibold mb-2">Нет чатов</h3>
          <p className="text-gray-400 text-center mb-6">
            Начните общение с AI-компаньоном
          </p>
          <button className="bg-primary px-6 py-3 rounded-full font-semibold hover:bg-primary-dark transition-colors">
            Создать чат
          </button>
        </div>
      )}
    </div>
  );
};

export default Chats;

