import React, { useState } from 'react';

const Store = () => {
  const [selectedTab, setSelectedTab] = useState('credits'); // credits, premium, items

  const creditPackages = [
    { id: 1, credits: 100, price: 99, bonus: 0, popular: false },
    { id: 2, credits: 500, price: 449, bonus: 50, popular: true },
    { id: 3, credits: 1000, price: 799, bonus: 200, popular: false },
    { id: 4, credits: 5000, price: 3499, bonus: 1500, popular: false },
  ];

  const premiumFeatures = [
    'Безлимитные сообщения',
    'Приоритетная генерация',
    'Эксклюзивные персонажи',
    'Без рекламы',
    'Ранний доступ к новым функциям',
  ];

  const storeItems = [
    { id: 1, name: 'Голосовые сообщения', price: 299, icon: '🎙️', type: 'feature' },
    { id: 2, name: 'Генерация изображений', price: 399, icon: '🖼️', type: 'feature' },
    { id: 3, name: 'Пакет эмоций', price: 199, icon: '😊', type: 'pack' },
    { id: 4, name: 'Пакет стилей', price: 249, icon: '🎨', type: 'pack' },
  ];

  return (
    <div className="min-h-screen pb-4">
      {/* Заголовок и баланс */}
      <div className="sticky top-0 bg-background z-10 p-4 pt-6 pb-3">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Магазин</h1>
          <div className="bg-gradient-to-r from-primary to-purple-600 px-4 py-2 rounded-full font-semibold flex items-center">
            <span className="mr-1">⭐</span>
            <span>100</span>
          </div>
        </div>

        {/* Табы */}
        <div className="flex gap-2">
          {[
            { key: 'credits', label: 'Кредиты' },
            { key: 'premium', label: 'Premium' },
            { key: 'items', label: 'Предметы' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedTab === tab.key
                  ? 'bg-primary text-white'
                  : 'bg-background-secondary text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4">
        {/* Кредиты */}
        {selectedTab === 'credits' && (
          <div>
            <p className="text-gray-400 mb-4">
              Используйте кредиты для общения с AI-компаньонами
            </p>
            <div className="space-y-3">
              {creditPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`relative bg-background-secondary rounded-2xl p-5 border-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                    pkg.popular
                      ? 'border-primary shadow-lg shadow-primary/20'
                      : 'border-gray-800'
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-4 bg-gradient-to-r from-primary to-purple-600 px-3 py-1 rounded-full text-xs font-bold">
                      🔥 Популярное
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center text-2xl mr-4">
                        ⭐
                      </div>
                      <div>
                        <div className="flex items-baseline">
                          <span className="text-2xl font-bold">{pkg.credits}</span>
                          {pkg.bonus > 0 && (
                            <span className="ml-2 text-sm text-green-400 font-semibold">
                              +{pkg.bonus} бонус
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">кредитов</p>
                      </div>
                    </div>
                    <button className="bg-primary hover:bg-primary-dark px-6 py-3 rounded-xl font-semibold transition-colors">
                      {pkg.price} ₽
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Premium */}
        {selectedTab === 'premium' && (
          <div>
            <div className="bg-gradient-to-br from-primary to-purple-600 rounded-3xl p-6 mb-6">
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">👑</div>
                <h2 className="text-2xl font-bold mb-2">Premium подписка</h2>
                <p className="text-purple-200">Получите все возможности</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur rounded-2xl p-4 mb-6">
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-4xl font-bold">499</span>
                  <span className="text-xl ml-2">₽/месяц</span>
                </div>
                <p className="text-center text-sm text-purple-200">
                  Первый месяц за 299 ₽
                </p>
              </div>

              <button className="w-full bg-white text-primary font-bold py-4 rounded-2xl hover:bg-gray-100 transition-colors">
                Оформить подписку
              </button>
            </div>

            <div className="bg-background-secondary rounded-2xl p-5 border border-gray-800">
              <h3 className="font-semibold mb-4">Что входит в Premium:</h3>
              <div className="space-y-3">
                {premiumFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Предметы */}
        {selectedTab === 'items' && (
          <div>
            <p className="text-gray-400 mb-4">
              Дополнительные возможности и контент
            </p>
            <div className="grid grid-cols-2 gap-3">
              {storeItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-background-secondary rounded-2xl p-4 border border-gray-800 hover:border-primary/50 transition-all cursor-pointer"
                >
                  <div className="w-full aspect-square bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-xl flex items-center justify-center text-4xl mb-3">
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-sm mb-2">{item.name}</h3>
                  <button className="w-full bg-primary hover:bg-primary-dark py-2 rounded-lg text-sm font-semibold transition-colors">
                    {item.price} ⭐
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Store;

