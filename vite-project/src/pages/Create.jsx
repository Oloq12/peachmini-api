import React, { useState } from 'react';

const Create = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const templates = [
    { id: 1, name: 'Подруга', description: 'Дружелюбная и открытая', icon: '👩‍🦰', color: 'from-pink-500 to-rose-500' },
    { id: 2, name: 'Романтик', description: 'Чувственная и нежная', icon: '💕', color: 'from-red-500 to-pink-500' },
    { id: 3, name: 'Спортсменка', description: 'Активная и энергичная', icon: '🏃‍♀️', color: 'from-green-500 to-emerald-500' },
    { id: 4, name: 'Художница', description: 'Творческая натура', icon: '🎨', color: 'from-purple-500 to-pink-500' },
    { id: 5, name: 'Учёная', description: 'Умная и эрудированная', icon: '👩‍🔬', color: 'from-blue-500 to-cyan-500' },
    { id: 6, name: 'Музыкант', description: 'Мелодичная душа', icon: '🎵', color: 'from-violet-500 to-purple-500' },
  ];

  return (
    <div className="min-h-screen p-4 pt-6">
      {/* Заголовок */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          Создать компаньона ✨
        </h1>
        <p className="text-gray-400">Выбери шаблон или создай уникального персонажа</p>
      </div>

      {/* Быстрое создание */}
      <div className="mb-6">
        <button className="w-full bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-6 text-left hover:scale-[1.02] transition-transform active:scale-[0.98]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl mb-2">🎲</div>
              <h3 className="text-xl font-bold mb-1">Случайный персонаж</h3>
              <p className="text-sm text-purple-200">Создать уникального компаньона за секунду</p>
            </div>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </button>
      </div>

      {/* Шаблоны */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Шаблоны персонажей</h2>
        <div className="grid grid-cols-2 gap-3">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className={`bg-background-secondary rounded-2xl p-4 text-left border-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${
                selectedTemplate === template.id
                  ? 'border-primary'
                  : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${template.color} rounded-xl flex items-center justify-center text-2xl mb-3`}>
                {template.icon}
              </div>
              <h3 className="font-semibold mb-1">{template.name}</h3>
              <p className="text-xs text-gray-400">{template.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Продвинутое создание */}
      <div className="mb-6">
        <button className="w-full bg-background-secondary rounded-2xl p-5 border border-gray-800 hover:border-primary/50 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-semibold mb-1">Продвинутое создание</h3>
                <p className="text-xs text-gray-400">Настройте все параметры детально</p>
              </div>
            </div>
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>

      {/* Кнопка действия */}
      {selectedTemplate && (
        <div className="fixed bottom-24 left-0 right-0 px-4">
          <button className="w-full bg-primary text-white font-semibold py-4 rounded-2xl shadow-lg shadow-primary/50 hover:bg-primary-dark transition-colors">
            Создать из шаблона
          </button>
        </div>
      )}
    </div>
  );
};

export default Create;

