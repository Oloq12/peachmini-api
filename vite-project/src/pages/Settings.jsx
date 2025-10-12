import React, { useState } from 'react';

const Settings = () => {
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [language, setLanguage] = useState('ru');

  const settingsSections = [
    {
      title: 'Аккаунт',
      items: [
        { icon: '👤', label: 'Профиль', description: 'Редактировать информацию', action: () => {} },
        { icon: '🔐', label: 'Приватность', description: 'Управление данными', action: () => {} },
        { icon: '👑', label: 'Premium', description: 'Управление подпиской', highlight: true, action: () => {} },
      ],
    },
    {
      title: 'Настройки',
      items: [
        { 
          icon: '🔔', 
          label: 'Уведомления', 
          description: 'Получать оповещения',
          toggle: true,
          value: notifications,
          onChange: setNotifications,
        },
        { 
          icon: '🔊', 
          label: 'Звуки', 
          description: 'Звуковые эффекты',
          toggle: true,
          value: soundEnabled,
          onChange: setSoundEnabled,
        },
        { icon: '🌍', label: 'Язык', description: language === 'ru' ? 'Русский' : 'English', action: () => {} },
        { icon: '🎨', label: 'Тема', description: 'Тёмная', action: () => {} },
      ],
    },
    {
      title: 'Информация',
      items: [
        { icon: '❓', label: 'Помощь', description: 'FAQ и поддержка', action: () => {} },
        { icon: '⭐', label: 'Оценить приложение', description: 'Поделиться отзывом', action: () => {} },
        { icon: '📄', label: 'Условия использования', action: () => {} },
        { icon: '🔒', label: 'Политика конфиденциальности', action: () => {} },
      ],
    },
  ];

  return (
    <div className="min-h-screen p-4 pt-6 pb-4">
      {/* Профиль пользователя */}
      <div className="bg-gradient-to-br from-primary to-purple-600 rounded-3xl p-6 mb-6">
        <div className="flex items-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-4xl mr-4">
            👤
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1">Пользователь</h2>
            <p className="text-purple-200">user@example.com</p>
          </div>
          <button className="bg-white/20 backdrop-blur px-4 py-2 rounded-xl font-semibold hover:bg-white/30 transition-colors">
            Изменить
          </button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-background-secondary rounded-2xl p-4 text-center border border-gray-800">
          <div className="text-2xl font-bold text-primary">12</div>
          <div className="text-xs text-gray-400 mt-1">Дней подряд</div>
        </div>
        <div className="bg-background-secondary rounded-2xl p-4 text-center border border-gray-800">
          <div className="text-2xl font-bold text-primary">245</div>
          <div className="text-xs text-gray-400 mt-1">Сообщений</div>
        </div>
        <div className="bg-background-secondary rounded-2xl p-4 text-center border border-gray-800">
          <div className="text-2xl font-bold text-primary">8</div>
          <div className="text-xs text-gray-400 mt-1">Персонажей</div>
        </div>
      </div>

      {/* Секции настроек */}
      {settingsSections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="mb-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
            {section.title}
          </h3>
          <div className="bg-background-secondary rounded-2xl border border-gray-800 overflow-hidden">
            {section.items.map((item, itemIndex) => (
              <button
                key={itemIndex}
                onClick={item.action}
                className={`w-full p-4 flex items-center hover:bg-background-tertiary transition-colors ${
                  itemIndex !== section.items.length - 1 ? 'border-b border-gray-800' : ''
                } ${item.highlight ? 'bg-primary/10' : ''}`}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-xl flex items-center justify-center text-xl mr-3 flex-shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold flex items-center">
                    {item.label}
                    {item.highlight && (
                      <span className="ml-2 bg-gradient-to-r from-primary to-purple-600 px-2 py-0.5 rounded-full text-xs">
                        Pro
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <div className="text-sm text-gray-400">{item.description}</div>
                  )}
                </div>
                {item.toggle ? (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      item.onChange(!item.value);
                    }}
                    className={`relative w-12 h-7 rounded-full transition-colors cursor-pointer ${
                      item.value ? 'bg-primary' : 'bg-gray-700'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                        item.value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </div>
                ) : (
                  <svg className="w-5 h-5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Версия приложения */}
      <div className="text-center text-sm text-gray-500 mb-4">
        Версия 1.0.0
      </div>

      {/* Кнопка выхода */}
      <button className="w-full bg-background-secondary border border-red-900/30 text-red-500 font-semibold py-4 rounded-2xl hover:bg-red-950/20 transition-colors">
        Выйти из аккаунта
      </button>
    </div>
  );
};

export default Settings;

